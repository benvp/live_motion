# Changelog

All notable changes to this project will be documented in this file.

## [v0.3.0]

### Breaking changes

- Remove possibility to animate non LiveMotion components.

### Improvements

- Use `createMotionState` for handling of the animation states.

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
