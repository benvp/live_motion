# Changelog

All notable changes to this project will be documented in this file.

## [v0.3.1] (2023-09-11)

### Changes

- Update supported Phoenix versions.

## [v0.3.0] (2022-10-26)

### Breaking changes

- Support for LiveView 0.18. The minimum required version is LiveView 0.18 now.
- Remove possibility to animate non LiveMotion components.
- Rename event props to `on_motion_start` and `on_motion_complete` to be more compliant with
other motion implementations.

### New Features

- The `motion` component now uses `dynamic_tag` from LiveView. This allows you to change the
rendered HTML element.
- The `motion` component can be be self-closing (`<LiveMotion.motion />`).
- Support for `glide` animations.
- Use provided `duration` as a hint when using `spring` or `glide` easing functions.
- Add `hover`, `press`, `in_view`, `in_view_options` props.

### Improvements

- Use `createMotionState` for handling of the animation states.
- Update `motion` to `10.14.2`.

## [v0.2.0] (2022-05-18)

### Added

- Adds new lifecycle functions `on_animation_start` and `on_animation_complete`.
- Make `LiveMotion.JS` functions composable with `Phoenix.LiveView.JS`.

### Changed

- Converted JavaScript codebase to TypeScript.

### Bugfixes

- Animations trigger correctly when a component is updated. ([[#3](https://github.com/benvp/live_motion/issues/3)]).

## [v0.1.2] (2022-04-14)

### Added

- Added `LiveMotion.JS.show/1` to allow animations when showing elements.
- Added `defer` option to `LiveMotion.motion` to prevent animations on mount.

## [v0.1.1] (2022-04-12)

### Fixed

- Incorrect `to` option on `LiveMotion.motion`. This broke exit animations
  when navigating to other pages.

## [v0.1.0] (2022-04-12)

🚀 Initial release.
