import { animate, spring } from 'motion';
import {
  LiveMotionAnimateEvent,
  LiveMotionConfig,
  LiveMotionHideEvent,
  LiveMotionHooksDefinition,
  LiveMotionShowEvent,
  LiveMotionToggleEvent,
  Optional,
} from './types';

const MAX_TRANSITION_DURATION = 10 * 1000;
const DEFAULT_TRANSITION_DURATION = 300;

const doAnimation = (el: HTMLElement, config: Optional<LiveMotionConfig, 'opts'>) => {
  const { keyframes, transition, opts } = config;

  const animationWithLifecycle = (animateFn: () => ReturnType<typeof animate>) => {
    if (opts?.on_animation_start) {
      liveSocket.execJS(el, opts.on_animation_start);
    }

    const animation = animateFn();

    animation.finished.then((animations: any) => {
      if (opts?.on_animation_complete) {
        liveSocket.execJS(el, opts.on_animation_complete);
      }

      return animations;
    });

    return animation;
  };

  if (transition?.__easing?.[0] === 'spring') {
    const {
      __easing: [_, options],
      ...t
    } = transition;

    return animationWithLifecycle(() => animate(el, keyframes, { ...t, easing: spring(options) }));
  } else {
    return animationWithLifecycle(() => animate(el, keyframes, transition));
  }
};

const performTransition = (
  target: HTMLElement,
  duration: number,
  config: Optional<LiveMotionConfig, 'opts'>,
) =>
  new Promise((resolve, reject) => {
    // TODO: check if there is a better way than relying on the global
    // liveSocket variable.
    liveSocket.transition(duration, () => {
      // resolving with the controls does not work as controls
      // is a Proxy and then something within motion fails.
      // For now, we only resolve when the animation finishes
      // or reject if it cancels.
      doAnimation(target, config).finished.then(resolve).catch(reject);
    });
  });

function createMotionHook(): LiveMotionHooksDefinition {
  return {
    Motion: {
      getConfig() {
        return getMotionConfig(this.el);
      },
      maybeAnimate() {
        const config = this.getConfig();

        if (config && !config?.opts.defer) {
          doAnimation(this.el, config);
        }
      },
      mounted() {
        this.maybeAnimate();
      },
      updated() {
        this.maybeAnimate();
      },
    },
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
    const { target, detail } = e as LiveMotionAnimateEvent;

    if (detail && target) {
      const { keyframes, transition } = detail || {};
      const { opts } = getMotionConfig(target) ?? {};

      if (target) {
        doAnimation(target, { keyframes, transition, opts });
      }
    }
  });

  window.addEventListener('live_motion:hide', (e) => {
    const { target, detail } = e as LiveMotionHideEvent;

    if (target && detail?.keyframes && Object.keys(detail.keyframes).length > 0) {
      // params given
      const { keyframes, transition } = detail;
      const { opts } = getMotionConfig(target) ?? {};
      const duration = getDuration(transition);

      performTransition(target as HTMLElement, duration, { keyframes, transition, opts }).then(
        () => (target.style.display = 'none'),
      );
    } else {
      // infer params from target
      if (liveSocket.isDebugEnabled() && !target.dataset.motion) {
        console.warn(
          '[LiveMotion] Motion configuration is not defined. Did you forget to make your target a LiveMotion.motion component?',
        );
      }

      const { exit, transition, opts } = getMotionConfig(target) ?? {};

      if (exit) {
        const duration = getDuration(transition);

        performTransition(target, duration, { keyframes: exit, transition, opts }).then(
          () => (target.style.display = 'none'),
        );
      }
    }
  });

  window.addEventListener('live_motion:show', (e) => {
    const { target, detail } = e as LiveMotionShowEvent;

    if (target && detail?.keyframes && Object.keys(detail.keyframes).length > 0) {
      // params given
      const { keyframes, transition, display } = detail;
      const { opts } = getMotionConfig(target) ?? {};
      const duration = getDuration(transition);

      target.style.display = display;
      performTransition(target, duration, { keyframes, transition, opts });
    } else {
      // infer params from target
      if (liveSocket.isDebugEnabled() && !target.dataset.motion) {
        console.warn(
          '[LiveMotion] Motion configuration is not defined. Did you forget to make your target a LiveMotion.motion component?',
        );
      }

      const { keyframes, transition, opts } = getMotionConfig(target) ?? {};
      const duration = getDuration(transition);

      if (detail) {
        target.style.display = detail.display;
      }

      if (keyframes) {
        performTransition(target, duration, { keyframes, transition, opts });
      }
    }
  });

  window.addEventListener('live_motion:toggle', (e) => {
    const { target, detail } = e as LiveMotionToggleEvent;

    if (detail) {
      const { keyframes, transition } = detail;
      const { opts } = getMotionConfig(target) ?? {};

      const toggle = target.dataset.motionToggle === 'true';

      const kf =
        !keyframes.in || !keyframes.out ? keyframes : toggle ? keyframes.in : keyframes.out;
      const t =
        !transition.in || !transition.out ? transition : toggle ? transition.in : transition.out;

      doAnimation(target, { keyframes: kf, transition: t, opts });

      target.dataset.motionToggle = String(!toggle);
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
