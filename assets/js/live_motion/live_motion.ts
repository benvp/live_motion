import { animate, createMotionState, spring, mountedStates, glide } from 'motion';
import {
  LiveMotionAnimateEvent,
  LiveMotionConfig,
  LiveMotionHideEvent,
  LiveMotionHook,
  LiveMotionHooksDefinition,
  LiveMotionOptions,
  LiveMotionShowEvent,
  LiveMotionToggleEvent,
  MaybeAnimateOptions,
  PresenceConfig,
  PresenceHook,
} from './types';

const MAX_TRANSITION_DURATION = 10 * 1000;
const DEFAULT_TRANSITION_DURATION = 300;

const parentHooks = new WeakMap<Element, LiveMotionHook>();
const motionHooks = new WeakMap<Element, LiveMotionHook>();
const presenceHooks = new WeakMap<Element, PresenceHook>();

function maybeGetPresence(el: Element) {
  const parent = el.parentElement;
  const presenceEl =
    parent?.hasAttribute('phx-hook') && parent?.getAttribute('phx-hook') === 'Presence'
      ? parent
      : undefined;

  return presenceEl && presenceHooks.get(presenceEl);
}

function createPresenceHook() {
  // this should only register if the presence component is in place?
  window.addEventListener('live_motion:hide', (e) => {
    const { target } = e as LiveMotionHideEvent;
    const presenceHook = maybeGetPresence(target);

    if (presenceHook && !presenceHook.exiting) {
      presenceHook.exitTransition(
        target,
        () => !presenceHook.exiting && presenceHook.mountComponents(),
      );
    }
  });

  /**
   * 1. Mount hook receives new element
   * 2. Presence needs to check if it already has any mounted element
   * 3. If yes, the new mount animation needs to be deferred until exit completes
   * 4. When exit completes, call mount animation
   */
  const Presence = {
    mountComponents() {
      this.mounts.forEach((fn) => fn());
      this.mounts = [];
    },
    getConfig() {
      return this.el.dataset.motion
        ? (JSON.parse(this.el.dataset.motion) as PresenceConfig)
        : undefined;
    },
    exitTransition(exitEl: Element, done) {
      const motion = motionHooks.get(exitEl);

      if (motion) {
        const duration = getDuration(motion.getConfig()?.transition);

        liveSocket.transition(duration, () => {
          motion.el.addEventListener(
            'motioncomplete',
            () => {
              motion.el.style.display = 'none';
              this.exiting = false;
              this.unmounts.forEach((fn) => fn());
              this.unmounts = [];
              done?.();
            },
            {
              once: true,
            },
          );

          this.exiting = true;
          motion.state?.setActive('exit', true);
        });
      }
    },
    addMount(fn: () => void) {
      this.mounts.push(fn);

      if (this.unmounts.length === 0) {
        // When we don't have any unmounts, then we are mounting the initial component
        // which means we can directly mount without waiting for any unmounts.
        this.mountComponents();
      }
    },
    addCleanup(fn: () => void) {
      this.unmounts.push(fn);
    },
    mounted() {
      this.exiting = false;
      this.mounts = [];
      this.unmounts = [];

      presenceHooks.set(this.el, this);
    },
    destroyed() {
      presenceHooks.delete(this.el);
    },
  } as PresenceHook;

  return Presence;
}

function createMotionHook(): LiveMotionHook {
  function registerEventHandlers(this: LiveMotionHook) {
    const config = this.getConfig();

    this.eventHandlers = {
      motionstart: () => {
        liveSocket.execJS(this.el, config?.on_motion_start);
      },
      motioncomplete: () => {
        liveSocket.execJS(this.el, config?.on_motion_complete);
      },
    };

    if (config?.on_motion_start) {
      this.el.addEventListener('motionstart', this.eventHandlers['motionstart']);
    }

    if (config?.on_motion_complete) {
      this.el.addEventListener('motioncomplete', this.eventHandlers['motioncomplete']);
    }
  }

  function maybeGetParent(el: Element) {
    const parentElement = el.parentElement?.closest('[data-motion]');
    return parentElement && motionHooks.get(parentElement);
  }

  return {
    getConfig() {
      return this.el.dataset.motion
        ? (JSON.parse(this.el.dataset.motion) as LiveMotionConfig)
        : undefined;
    },
    getMotionOptions(): LiveMotionOptions | undefined {
      const config = this.getConfig();

      if (!config) {
        return undefined;
      }

      const translateEasing = () => {
        const { transition } = config;

        if (transition?.easing === 'spring') {
          return spring();
        }

        if (transition?.easing === 'glide') {
          return glide();
        }

        if (typeof transition?.easing === 'object' && !Array.isArray(transition.easing)) {
          if (transition.easing.spring) {
            return spring(transition.easing.spring);
          }

          if (transition.easing.glide) {
            return glide(transition.easing.glide);
          }
        }

        return transition?.easing;
      };

      const transition = config.transition?.easing
        ? { ...config.transition, easing: translateEasing() }
        : config.transition;

      return {
        initial: config.initial,
        animate: config.animate,
        exit: config.exit,
        hover: config.hover,
        press: config.press,
        inView: config.in_view,
        inViewOptions: config.in_view_options,
        transition,
      };
    },
    maybeAnimate(options: MaybeAnimateOptions) {
      const { force = false } = options || {};
      const config = this.getConfig();
      const motionOptions = this.getMotionOptions();

      if (this.state && motionOptions && config && (!config?.defer || force)) {
        this.state.update(motionOptions);
      }
    },
    mounted() {
      motionHooks.set(this.el, this);

      // determine the parent
      const parentHook = maybeGetParent(this.el);

      if (parentHook) {
        parentHooks.set(this.el, parentHook);
      }

      registerEventHandlers.apply(this);

      this.state = createMotionState(this.getMotionOptions(), parentHook?.state);

      const presenceHook = maybeGetPresence(this.el);

      if (presenceHook) {
        // If we are placed inside a Presence component, we want
        // to delegate mounting/unmounting to the Presence hook
        const display = this.el.style.display;
        this.el.style.display = 'none';

        presenceHook.addMount(() => {
          if (this.state) {
            presenceHook.addCleanup(this.state.mount(this.el));
            this.el.style.display = display;
            this.maybeAnimate();
          }
        });
      } else {
        this.cleanup = this.state.mount(this.el);
        this.maybeAnimate();
      }
    },
    destroyed() {
      // unregister event handlers
      if (this.eventHandlers) {
        Object.entries(this.eventHandlers).forEach(([e, fn]) => this.el.removeEventListener(e, fn));
      }

      parentHooks.delete(this.el);
      motionHooks.delete(this.el);

      this.cleanup?.();
    },
    updated() {
      this.maybeAnimate();
    },
  } as LiveMotionHook;
}

function handleMotionUpdates(from: HTMLElement, to: HTMLElement) {
  /**
   * We need to copy over the style attribute because otherwise
   * each dom patch would reset the styles, resulting in
   * broken animations.
   */
  if (from.dataset.motion) {
    if (from.getAttribute('style') === null) {
      to.removeAttribute('style');
    } else {
      to.setAttribute('style', from.getAttribute('style') as string);
    }
  }
}

export function createLiveMotion() {
  window.addEventListener('live_motion:animate', (e) => {
    const { target } = e as LiveMotionAnimateEvent;
    const motion = motionHooks.get(target);

    if (!motion && liveSocket.isDebugEnabled()) {
      console.warn(
        '[LiveMotion] Motion element not found. Did you forget to make your target a LiveMotion.motion component?',
      );
    }

    if (motion) {
      motion.maybeAnimate({ force: true });
    }
  });

  window.addEventListener('live_motion:hide', (e) => {
    const { target } = e as LiveMotionHideEvent;
    const motion = motionHooks.get(target);
    const presence = maybeGetPresence(target);

    if (!motion && liveSocket.isDebugEnabled()) {
      console.warn(
        '[LiveMotion] Motion element not found. Did you forget to make your target a LiveMotion.motion component?',
      );
    }

    if (!presence && motion) {
      const duration = getDuration(motion.getConfig()?.transition);

      // We need to call the LiveSocket transition so that LiveView
      // will wait until the transition is finished before removing
      // the element from the DOM.
      liveSocket.transition(duration, () => {
        motion.el.addEventListener('motioncomplete', () => (motion.el.style.display = 'none'), {
          once: true,
        });

        motion.state?.setActive('exit', true);
      });
    }
  });

  window.addEventListener('live_motion:show', (e) => {
    const { target, detail } = e as LiveMotionShowEvent;
    const motion = motionHooks.get(target);

    if (!motion && liveSocket.isDebugEnabled()) {
      console.warn(
        '[LiveMotion] Motion element not found. Did you forget to make your target a LiveMotion.motion component?',
      );
    }

    if (motion) {
      motion.el.style.display = detail?.display ?? 'block';
      motion.state?.setActive('exit', false);
      motion.state?.setActive('animate', true);
    }
  });

  window.addEventListener('live_motion:toggle', (e) => {
    const { target } = e as LiveMotionToggleEvent;
    const motion = motionHooks.get(target);

    if (!motion && liveSocket.isDebugEnabled()) {
      console.warn(
        '[LiveMotion] Motion element not found. Did you forget to make your target a LiveMotion.motion component?',
      );
    }

    if (motion) {
      const toggle = motion.el.hasAttribute('data-motion-toggle')
        ? motion.el.dataset.motionToggle === 'true'
        : !motion.getConfig()?.defer;

      motion.el.dataset.motionToggle = String(!toggle);
      motion.state?.setActive('exit', toggle);
    }
  });

  return {
    hooks: {
      Motion: createMotionHook(),
      Presence: createPresenceHook(),
    },
    handleMotionUpdates,
  };
}

function getDuration(transition?: LiveMotionConfig['transition']) {
  // As spring animations do not have any duration and the duration
  // can not be calculated, we have to fall back to the maximum of 10 seconds.
  // The element, however, will be hidden as soon as the animation finishes.

  const isPhysics =
    transition &&
    ((typeof transition.easing === 'object' && !Array.isArray(transition.easing)) ||
      transition.easing === 'spring' ||
      transition.easing === 'glide');

  if (isPhysics && typeof transition?.duration !== 'undefined') {
    return transition.duration * 1000;
  }

  return isPhysics
    ? MAX_TRANSITION_DURATION
    : typeof transition?.duration !== 'undefined'
    ? transition.duration * 1000
    : DEFAULT_TRANSITION_DURATION;
}
