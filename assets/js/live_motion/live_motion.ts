import { createMotionState, spring, glide } from 'motion';
import { compactObj } from './helpers';
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
} from './types';

const MAX_TRANSITION_DURATION = 10 * 1000;
const DEFAULT_TRANSITION_DURATION = 300;

const motionHooks = new WeakMap<Element, LiveMotionHook>();

function createMotionHook(): LiveMotionHooksDefinition {
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

  return {
    Motion: {
      getConfig() {
        return getMotionConfig(this.el);
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

        const options = {
          initial: config.initial,
          animate: config.animate,
          exit: config.exit,
          hover: config.hover,
          press: config.press,
          inView: config.in_view,
          inViewOptions: config.in_view_options,
          transition,
        };

        return compactObj(options);
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
        registerEventHandlers.apply(this);

        this.state = createMotionState(this.getMotionOptions());
        this.cleanup = this.state.mount(this.el);
        this.maybeAnimate();
      },
      destroyed() {
        // unregister event handlers
        if (this.eventHandlers) {
          Object.entries(this.eventHandlers).forEach(([e, fn]) =>
            this.el.removeEventListener(e, fn),
          );
        }

        motionHooks.delete(this.el);
        this.cleanup?.();
      },
      updated() {
        this.maybeAnimate();
      },
    } as LiveMotionHook,
  };
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

    if (!motion && liveSocket.isDebugEnabled()) {
      console.warn(
        '[LiveMotion] Motion element not found. Did you forget to make your target a LiveMotion.motion component?',
      );
    }

    if (motion) {
      const duration = getDuration(motion.getConfig()?.transition);

      // We need to call the LiveSocket transition so that LiveView
      // will wait until the transition is finished before removing
      // the element from the DOM.
      liveSocket.transition(duration, () => {
        const motion = motionHooks.get(target);

        if (motion) {
          motion.el.addEventListener('motioncomplete', () => (motion.el.style.display = 'none'), {
            once: true,
          });

          motion.state?.setActive('exit', true);
        }
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
    hook: createMotionHook(),
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

function getMotionConfig(el: HTMLElement) {
  return el.dataset.motion ? (JSON.parse(el.dataset.motion) as LiveMotionConfig) : undefined;
}
