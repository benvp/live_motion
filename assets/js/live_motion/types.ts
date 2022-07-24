import { AnimationOptionsWithOverrides, MotionKeyframesDefinition, spring } from '@motionone/dom';
import { MotionState, VariantDefinition } from 'motion';

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

declare global {
  const liveSocket: any;
}

type LiveViewJSDefinition = any[];

// type SpringOptions is not exported, so we extract it from the function definition.
export type LiveMotionSpringOptions = Parameters<typeof spring>[0];

// TODO: check if can be removed or if we can get away someway else
export type LiveMotionAnimationOptions = AnimationOptionsWithOverrides & {
  __easing?: ['spring', LiveMotionSpringOptions];
};

export type LiveMotionConfigOptions = {
  defer?: boolean;
  on_animation_start?: LiveViewJSDefinition;
  on_animation_complete?: LiveViewJSDefinition;
};

export type LiveMotionConfig = {
  initial: VariantDefinition;
  animate: VariantDefinition;
  transition?: LiveMotionAnimationOptions;
  exit?: VariantDefinition;
  opts: LiveMotionConfigOptions;
};

export type LiveMotionHooksDefinition = {
  Motion: LiveMotionHook;
};

// TODO: Check if we can use Options form Motion directly
export type MotionOptions = Pick<LiveMotionConfig, 'initial' | 'animate' | 'exit' | 'transition'>;

export type MaybeAnimateOptions = {
  force: boolean;
};

type LiveViewHookType = {
  // LiveView provided functions
  mounted?(): void;
  updated?(): void;
  destroyed?(): void;
  disconnected?(): void;
  reconnected?(): void;

  el: HTMLElement;
  liveSocket: any;
};

type LiveMotionType = {
  eventHandlers: Record<string, () => void>;
  getConfig(): LiveMotionConfig | undefined;
  getMotionOptions(): MotionOptions | undefined;
  maybeAnimate(options?: MaybeAnimateOptions): void;
  state?: MotionState;
  cleanup?: ReturnType<MotionState['mount']>;
};

export type LiveMotionHook = LiveMotionType &
  Pick<LiveViewHookType, 'el' | 'mounted' | 'destroyed' | 'updated'> &
  ThisType<LiveMotionType & LiveViewHookType>;

export interface LiveMotionEvent<T = unknown> extends Event {
  readonly detail?: T;
  target: HTMLElement;
}

export type LiveMotionAnimateEvent = LiveMotionEvent;

export type LiveMotionHideEvent = LiveMotionEvent;

export type LiveMotionShowEvent = LiveMotionEvent<{
  display: string;
}>;

export type LiveMotionToggleEvent = LiveMotionEvent;
