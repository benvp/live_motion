import { AnimationOptionsWithOverrides, MotionKeyframesDefinition, spring } from '@motionone/dom';

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

declare global {
  const liveSocket: any;
}

type LiveViewJSDefinition = any[];

// type SpringOptions is not exported, so we extract it from the function definition.
export type LiveMotionSpringOptions = Parameters<typeof spring>[0];

export type LiveMotionAnimationOptions = AnimationOptionsWithOverrides & {
  __easing?: ['spring', LiveMotionSpringOptions];
};

export type LiveMotionConfigOptions = {
  defer?: boolean;
  on_animation_start?: LiveViewJSDefinition;
  on_animation_complete?: LiveViewJSDefinition;
};

export type LiveMotionConfig = {
  keyframes: MotionKeyframesDefinition;
  transition?: LiveMotionAnimationOptions;
  exit?: MotionKeyframesDefinition;
  opts: LiveMotionConfigOptions;
};

export type LiveMotionHooksDefinition = {
  Motion: LiveMotionHook;
};

export type LiveMotionHook = ThisType<{
  // LiveView provided functions
  el: HTMLElement;
  liveSocket: any;
  mounted(): any;
  updated(): any;
  destroyed(): any;
  disconnected(): any;
  reconnected(): any;

  getConfig(): LiveMotionConfig | undefined;
  maybeAnimate(): void;
}>;

export interface LiveMotionEvent<T> extends Event {
  readonly detail?: T;
  target: HTMLElement;
}

export type LiveMotionAnimateEvent = LiveMotionEvent<
  Pick<LiveMotionConfig, 'keyframes' | 'transition'>
>;

export type LiveMotionHideEvent = LiveMotionEvent<LiveMotionConfig>;

export type LiveMotionShowEvent = LiveMotionEvent<
  Pick<LiveMotionConfig, 'keyframes' | 'transition'> & {
    display: string;
  }
>;

export type LiveMotionToggleEvent = LiveMotionEvent<
  Pick<LiveMotionConfig, 'keyframes' | 'transition'> & {
    keyframes: {
      in: LiveMotionConfig['keyframes'];
      out: LiveMotionConfig['keyframes'];
    };
    transition: {
      in: LiveMotionConfig['transition'];
      out: LiveMotionConfig['transition'];
    };
  }
>;
