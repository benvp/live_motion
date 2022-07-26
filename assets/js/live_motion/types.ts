import { AnimationOptionsWithOverrides, MotionKeyframesDefinition, spring } from '@motionone/dom';
import {
  Easing,
  EasingFunction,
  EasingGenerator,
  glide,
  MotionState,
  VariantDefinition,
  Options as MotionOptions,
} from 'motion';

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

declare global {
  const liveSocket: any;
}

type LiveViewJSDefinition = any[];

// type SpringOptions is not exported, so we extract it from the function definition.
export type LiveMotionSpringOptions = Parameters<typeof spring>[0];
export type LiveMotionGlideOptions = Parameters<typeof glide>[0];

type LiveMotionEasingOptions =
  | 'spring'
  | 'glide'
  | { spring?: LiveMotionSpringOptions; glide?: LiveMotionGlideOptions };

// TODO: check if can be removed or if we can get away someway else
export type LiveMotionAnimationOptions = AnimationOptionsWithOverrides & {
  easing?: Easing | Easing[] | 'spring' | LiveMotionEasingOptions;
};

export type LiveMotionOptions = MotionOptions & {
  exit?: VariantDefinition;
};

export type LiveMotionConfig = Omit<
  LiveMotionOptions,
  'transition' | 'inView' | 'inViewOptions'
> & {
  in_view: MotionOptions['inView'];
  in_view_options: MotionOptions['inViewOptions'];
  transition?: LiveMotionAnimationOptions;
  defer?: boolean;
  on_motion_start?: LiveViewJSDefinition;
  on_motion_complete?: LiveViewJSDefinition;
};

export type LiveMotionHooksDefinition = {
  Motion: LiveMotionHook;
};

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
