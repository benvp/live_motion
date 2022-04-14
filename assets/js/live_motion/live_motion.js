import { animate, spring } from 'motion';

const MAX_TRANSITION_DURATION = 10 * 1000;
const DEFAULT_TRANSITION_DURATION = 300;

const doAnimation = (el, config) => {
  const { keyframes, transition } = config;

  if (transition?.__easing?.[0] === 'spring') {
    const {
      __easing: [_, options],
      ...t
    } = transition;

    return animate(el, keyframes, { ...t, easing: spring(options) });
  } else {
    return animate(el, keyframes, transition);
  }
};

const performTransition = (target, duration, config) =>
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

function createMotionHook() {
  return {
    Motion: {
      getConfig() {
        return this.el.dataset.motion ? JSON.parse(this.el.dataset.motion) : undefined;
      },
      maybeAnimate() {
        const config = this.getConfig() || {};

        if (!config.defer) {
          doAnimation(this.el, config);
        }
      },
      mounted() {
        this.maybeAnimate();
      },
      updated() {
        this.animate();
      },
    },
  };
}

function handleMotionUpdates(from, to) {
  /**
   * We need to copy over the style attribute because otherwise
   * each dom patch would reset the styles, resulting in
   * broken animations.
   */
  if (from.dataset.motion) {
    if (from.getAttribute('style') === null) {
      to.removeAttribute('style');
    } else {
      to.setAttribute('style', from.getAttribute('style'));
    }
  }
}

export function createLiveMotion() {
  window.addEventListener('live_motion:animate', (e) => {
    const { keyframes, transition } = e.detail || {};
    doAnimation(e.target, { keyframes, transition });
  });

  window.addEventListener('live_motion:hide', (e) => {
    const target = e.target;

    if (e.detail?.keyframes && Object.keys(e.detail.keyframes).length > 0) {
      // params given
      const { keyframes, transition } = e.detail;
      const duration = getDuration(transition);

      performTransition(target, duration, { keyframes, transition }).then(
        () => (target.style.display = 'none'),
      );
    } else {
      // infer params from target
      if (liveSocket.isDebugEnabled() && !target.dataset.motion) {
        console.warn(
          '[LiveMotion] Motion configuration is not defined. Did you forget to make your target a LiveMotion.motion component?',
        );
      }

      const { exit, transition } = JSON.parse(target.dataset.motion);

      if (exit) {
        const duration = getDuration(transition);

        performTransition(target, duration, { keyframes: exit, transition }).then(
          () => (target.style.display = 'none'),
        );
      }
    }
  });

  window.addEventListener('live_motion:show', (e) => {
    const target = e.target;

    if (e.detail?.keyframes && Object.keys(e.detail.keyframes).length > 0) {
      // params given
      const { keyframes, transition, display } = e.detail;
      const duration = getDuration(transition);

      target.style.display = display;
      performTransition(target, duration, { keyframes, transition });
    } else {
      // infer params from target
      if (liveSocket.isDebugEnabled() && !target.dataset.motion) {
        console.warn(
          '[LiveMotion] Motion configuration is not defined. Did you forget to make your target a LiveMotion.motion component?',
        );
      }

      const { keyframes, transition } = JSON.parse(target.dataset.motion);
      const duration = getDuration(transition);

      target.style.display = e.detail.display;
      performTransition(target, duration, { keyframes, transition });
    }
  });

  window.addEventListener('live_motion:toggle', (e) => {
    const { keyframes, transition } = e.detail || {};
    const toggle = e.target.dataset.motionToggle === 'true';

    const kf = !keyframes.in || !keyframes.out ? keyframes : toggle ? keyframes.in : keyframes.out;
    const t =
      !transition.in || !transition.out ? transition : toggle ? transition.in : transition.out;

    doAnimation(e.target, { keyframes: kf, transition: t });

    e.target.dataset.motionToggle = !toggle;
  });

  return {
    hook: createMotionHook(),
    handleMotionUpdates,
  };
}

function getDuration(transition) {
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
