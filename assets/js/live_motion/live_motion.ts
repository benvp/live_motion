import { animate, createMotionState, spring, mountedStates } from 'motion';
import {
  LiveMotionAnimateEvent,
  LiveMotionConfig,
  LiveMotionHideEvent,
  LiveMotionHook,
  LiveMotionHooksDefinition,
  LiveMotionShowEvent,
  LiveMotionToggleEvent,
  MaybeAnimateOptions,
  MotionOptions,
  Optional,
} from './types';

const MAX_TRANSITION_DURATION = 10 * 1000;
const DEFAULT_TRANSITION_DURATION = 300;

// const doAnimation = (el: HTMLElement, config: Optional<LiveMotionConfig, 'opts'>) => {
//   const { keyframes, transition, opts } = config;

//   const animationWithLifecycle = (animateFn: () => ReturnType<typeof animate>) => {
//     if (opts?.on_animation_start) {
//       liveSocket.execJS(el, opts.on_animation_start);
//     }

//     const animation = animateFn();

//     animation.finished.then((animations: any) => {
//       if (opts?.on_animation_complete) {
//         liveSocket.execJS(el, opts.on_animation_complete);
//       }

//       return animations;
//     });

//     return animation;
//   };

//   if (transition?.__easing?.[0] === 'spring') {
//     const {
//       __easing: [_, options],
//       ...t
//     } = transition;

//     return animationWithLifecycle(() => animate(el, keyframes, { ...t, easing: spring(options) }));
//   } else {
//     return animationWithLifecycle(() => animate(el, keyframes, transition));
//   }
// };

const motionHooks = new WeakMap<Element, LiveMotionHook>();

function createMotionHook(): LiveMotionHooksDefinition {
  function registerEventHandlers(this: LiveMotionHook) {
    const config = this.getConfig();

    this.eventHandlers = {
      motionstart: () => {
        liveSocket.execJS(this.el, config?.opts.on_animation_start);
      },
      motioncomplete: () => {
        liveSocket.execJS(this.el, config?.opts.on_animation_complete);
      },
    };

    if (config?.opts.on_animation_start) {
      this.el.addEventListener('motionstart', this.eventHandlers['motionstart']);
    }

    if (config?.opts.on_animation_complete) {
      this.el.addEventListener('motioncomplete', this.eventHandlers['motioncomplete']);
    }
  }

  return {
    Motion: {
      getConfig() {
        return getMotionConfig(this.el);
      },
      getMotionOptions() {
        const config = this.getConfig();

        if (!config) {
          return undefined;
        }

        return {
          initial: config.initial,
          animate: config.animate,
          exit: config.exit,
          transition: config.transition,
        } as MotionOptions;
      },
      maybeAnimate(options: MaybeAnimateOptions) {
        const { force = false } = options || {};
        const config = this.getConfig();
        const motionOptions = this.getMotionOptions();

        if (this.state && motionOptions && config && (!config?.opts.defer || force)) {
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
      const duration = getDuration(motion.getMotionOptions()?.transition);

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
        : !motion.getConfig()?.opts.defer;

      motion.el.addEventListener(
        'motioncomplete',
        () => (motion.el.dataset.motionToggle = String(!toggle)),
        { once: true },
      );

      motion.state?.setActive('exit', toggle);
    }
  });

  return {
    hook: createMotionHook(),
    handleMotionUpdates,
  };
}

function getDuration(transition: LiveMotionConfig['transition']) {
  // As spring animations do not have any duration and the duration
  // can not be calculated, we have to fall back to the maximum of 10 seconds.
  // The element, however, will be hidden as soon as the animation finishes.
  // TODO: find a better way to handle spring animations.

  return transition?.__easing?.[0] === 'spring'
    ? MAX_TRANSITION_DURATION
    : typeof transition?.duration !== 'undefined'
    ? transition.duration * 1000
    : DEFAULT_TRANSITION_DURATION;
}

function getMotionConfig(el: HTMLElement) {
  return el.dataset.motion ? (JSON.parse(el.dataset.motion) as LiveMotionConfig) : undefined;
}
