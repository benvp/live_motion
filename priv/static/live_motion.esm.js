var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};

// node_modules/@motionone/types/dist/MotionValue.es.js
var MotionValue = class {
  setAnimation(animation) {
    this.animation = animation;
    animation === null || animation === void 0 ? void 0 : animation.finished.then(() => this.clearAnimation()).catch(() => {
    });
  }
  clearAnimation() {
    this.animation = this.generator = void 0;
  }
};

// node_modules/@motionone/dom/dist/animate/data.es.js
var data = new WeakMap();
function getAnimationData(element) {
  if (!data.has(element)) {
    data.set(element, {
      transforms: [],
      values: new Map()
    });
  }
  return data.get(element);
}
function getMotionValue(motionValues, name) {
  if (!motionValues.has(name)) {
    motionValues.set(name, new MotionValue());
  }
  return motionValues.get(name);
}

// node_modules/@motionone/utils/dist/array.es.js
function addUniqueItem(array, item) {
  array.indexOf(item) === -1 && array.push(item);
}

// node_modules/@motionone/utils/dist/clamp.es.js
var clamp = (min, max, v) => Math.min(Math.max(v, min), max);

// node_modules/@motionone/utils/dist/defaults.es.js
var defaults = {
  duration: 0.3,
  delay: 0,
  endDelay: 0,
  repeat: 0,
  easing: "ease"
};

// node_modules/@motionone/utils/dist/is.es.js
var isNumber = (value) => typeof value === "number";
var isEasingGenerator = (easing) => typeof easing === "object" && Boolean(easing.createAnimation);
var isCubicBezier = (easing) => Array.isArray(easing) && isNumber(easing[0]);
var isEasingList = (easing) => Array.isArray(easing) && !isNumber(easing[0]);

// node_modules/@motionone/utils/dist/mix.es.js
var mix = (min, max, progress2) => -progress2 * min + progress2 * max + min;

// node_modules/@motionone/utils/dist/noop.es.js
var noop = () => {
};
var noopReturn = (v) => v;

// node_modules/@motionone/utils/dist/progress.es.js
var progress = (min, max, value) => max - min === 0 ? 1 : (value - min) / (max - min);

// node_modules/@motionone/utils/dist/offset.es.js
function fillOffset(offset, remaining) {
  const min = offset[offset.length - 1];
  for (let i = 1; i <= remaining; i++) {
    const offsetProgress = progress(0, remaining, i);
    offset.push(mix(min, 1, offsetProgress));
  }
}
function defaultOffset(length) {
  const offset = [0];
  fillOffset(offset, length - 1);
  return offset;
}

// node_modules/@motionone/utils/dist/time.es.js
var time = {
  ms: (seconds) => seconds * 1e3,
  s: (milliseconds) => milliseconds / 1e3
};

// node_modules/@motionone/utils/dist/velocity.es.js
function velocityPerSecond(velocity, frameDuration) {
  return frameDuration ? velocity * (1e3 / frameDuration) : 0;
}

// node_modules/@motionone/utils/dist/wrap.es.js
var wrap = (min, max, v) => {
  const rangeSize = max - min;
  return ((v - min) % rangeSize + rangeSize) % rangeSize + min;
};

// node_modules/@motionone/dom/dist/animate/utils/transforms.es.js
var axes = ["", "X", "Y", "Z"];
var order = ["translate", "scale", "rotate", "skew"];
var transformAlias = {
  x: "translateX",
  y: "translateY",
  z: "translateZ"
};
var rotation = {
  syntax: "<angle>",
  initialValue: "0deg",
  toDefaultUnit: (v) => v + "deg"
};
var baseTransformProperties = {
  translate: {
    syntax: "<length-percentage>",
    initialValue: "0px",
    toDefaultUnit: (v) => v + "px"
  },
  rotate: rotation,
  scale: {
    syntax: "<number>",
    initialValue: 1,
    toDefaultUnit: noopReturn
  },
  skew: rotation
};
var transformDefinitions = new Map();
var asTransformCssVar = (name) => `--motion-${name}`;
var transforms = ["x", "y", "z"];
order.forEach((name) => {
  axes.forEach((axis) => {
    transforms.push(name + axis);
    transformDefinitions.set(asTransformCssVar(name + axis), baseTransformProperties[name]);
  });
});
var compareTransformOrder = (a, b) => transforms.indexOf(a) - transforms.indexOf(b);
var transformLookup = new Set(transforms);
var isTransform = (name) => transformLookup.has(name);
var addTransformToElement = (element, name) => {
  if (transformAlias[name])
    name = transformAlias[name];
  const { transforms: transforms2 } = getAnimationData(element);
  addUniqueItem(transforms2, name);
  element.style.transform = buildTransformTemplate(transforms2);
};
var buildTransformTemplate = (transforms2) => transforms2.sort(compareTransformOrder).reduce(transformListToString, "").trim();
var transformListToString = (template, name) => `${template} ${name}(var(${asTransformCssVar(name)}))`;

// node_modules/@motionone/dom/dist/animate/utils/css-var.es.js
var isCssVar = (name) => name.startsWith("--");
var registeredProperties = new Set();
function registerCssVariable(name) {
  if (registeredProperties.has(name))
    return;
  registeredProperties.add(name);
  try {
    const { syntax, initialValue } = transformDefinitions.has(name) ? transformDefinitions.get(name) : {};
    CSS.registerProperty({
      name,
      inherits: false,
      syntax,
      initialValue
    });
  } catch (e) {
  }
}

// node_modules/@motionone/easing/dist/cubic-bezier.es.js
var calcBezier = (t, a1, a2) => (((1 - 3 * a2 + 3 * a1) * t + (3 * a2 - 6 * a1)) * t + 3 * a1) * t;
var subdivisionPrecision = 1e-7;
var subdivisionMaxIterations = 12;
function binarySubdivide(x, lowerBound, upperBound, mX1, mX2) {
  let currentX;
  let currentT;
  let i = 0;
  do {
    currentT = lowerBound + (upperBound - lowerBound) / 2;
    currentX = calcBezier(currentT, mX1, mX2) - x;
    if (currentX > 0) {
      upperBound = currentT;
    } else {
      lowerBound = currentT;
    }
  } while (Math.abs(currentX) > subdivisionPrecision && ++i < subdivisionMaxIterations);
  return currentT;
}
function cubicBezier(mX1, mY1, mX2, mY2) {
  if (mX1 === mY1 && mX2 === mY2)
    return noopReturn;
  const getTForX = (aX) => binarySubdivide(aX, 0, 1, mX1, mX2);
  return (t) => t === 0 || t === 1 ? t : calcBezier(getTForX(t), mY1, mY2);
}

// node_modules/@motionone/easing/dist/steps.es.js
var steps = (steps2, direction = "end") => (progress2) => {
  progress2 = direction === "end" ? Math.min(progress2, 0.999) : Math.max(progress2, 1e-3);
  const expanded = progress2 * steps2;
  const rounded = direction === "end" ? Math.floor(expanded) : Math.ceil(expanded);
  return clamp(0, 1, rounded / steps2);
};

// node_modules/@motionone/animation/dist/utils/easing.es.js
var namedEasings = {
  ease: cubicBezier(0.25, 0.1, 0.25, 1),
  "ease-in": cubicBezier(0.42, 0, 1, 1),
  "ease-in-out": cubicBezier(0.42, 0, 0.58, 1),
  "ease-out": cubicBezier(0, 0, 0.58, 1)
};
var functionArgsRegex = /\((.*?)\)/;
function getEasingFunction(definition) {
  if (typeof definition === "function")
    return definition;
  if (Array.isArray(definition))
    return cubicBezier(...definition);
  if (namedEasings[definition])
    return namedEasings[definition];
  if (definition.startsWith("steps")) {
    const args = functionArgsRegex.exec(definition);
    if (args) {
      const argsArray = args[1].split(",");
      return steps(parseFloat(argsArray[0]), argsArray[1].trim());
    }
  }
  return noopReturn;
}
function getEasingForSegment(easing, i) {
  return isEasingList(easing) ? easing[wrap(0, easing.length, i)] : easing;
}

// node_modules/@motionone/animation/dist/utils/interpolate.es.js
var clampProgress = (p) => Math.min(1, Math.max(p, 0));
function interpolate(output, input = defaultOffset(output.length), easing = noopReturn) {
  const length = output.length;
  const remainder = length - input.length;
  remainder > 0 && fillOffset(input, remainder);
  return (t) => {
    let i = 0;
    for (; i < length - 2; i++) {
      if (t < input[i + 1])
        break;
    }
    let progressInRange = clampProgress(progress(input[i], input[i + 1], t));
    const segmentEasing = getEasingForSegment(easing, i);
    progressInRange = segmentEasing(progressInRange);
    return mix(output[i], output[i + 1], progressInRange);
  };
}

// node_modules/@motionone/animation/dist/Animation.es.js
var Animation = class {
  constructor(output, keyframes = [0, 1], { easing = defaults.easing, duration = defaults.duration, delay = defaults.delay, endDelay = defaults.endDelay, repeat = defaults.repeat, offset, direction = "normal" } = {}) {
    this.startTime = null;
    this.rate = 1;
    this.t = 0;
    this.cancelTimestamp = null;
    this.playState = "idle";
    this.finished = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
    if (isEasingGenerator(easing)) {
      const custom = easing.createAnimation(keyframes, () => "0", true);
      easing = custom.easing;
      if (custom.keyframes !== void 0)
        keyframes = custom.keyframes;
      if (custom.duration !== void 0)
        duration = custom.duration;
    }
    const totalDuration = duration * (repeat + 1);
    const interpolate$1 = interpolate(keyframes, offset, isEasingList(easing) ? easing.map(getEasingFunction) : getEasingFunction(easing));
    this.tick = (timestamp) => {
      var _a;
      if (this.pauseTime)
        timestamp = this.pauseTime;
      let t = (timestamp - this.startTime) * this.rate;
      this.t = t;
      t /= 1e3;
      t = Math.max(t - delay, 0);
      if (this.playState === "finished")
        t = totalDuration;
      const progress2 = t / duration;
      let currentIteration = Math.floor(progress2);
      let iterationProgress = progress2 % 1;
      if (!iterationProgress && progress2 >= 1) {
        iterationProgress = 1;
      }
      iterationProgress === 1 && currentIteration--;
      const iterationIsOdd = currentIteration % 2;
      if (direction === "reverse" || direction === "alternate" && iterationIsOdd || direction === "alternate-reverse" && !iterationIsOdd) {
        iterationProgress = 1 - iterationProgress;
      }
      const latest = interpolate$1(t >= totalDuration ? 1 : Math.min(iterationProgress, 1));
      output(latest);
      const isAnimationFinished = this.playState === "finished" || t >= totalDuration + endDelay;
      if (isAnimationFinished) {
        this.playState = "finished";
        (_a = this.resolve) === null || _a === void 0 ? void 0 : _a.call(this, latest);
      } else if (this.playState !== "idle") {
        this.frameRequestId = requestAnimationFrame(this.tick);
      }
    };
    this.play();
  }
  play() {
    var _a;
    const now = performance.now();
    this.playState = "running";
    if (this.pauseTime) {
      this.startTime = now - (this.pauseTime - ((_a = this.startTime) !== null && _a !== void 0 ? _a : 0));
    } else if (!this.startTime) {
      this.startTime = now;
    }
    this.cancelTimestamp = this.startTime;
    this.pauseTime = void 0;
    requestAnimationFrame(this.tick);
  }
  pause() {
    this.playState = "paused";
    this.pauseTime = performance.now();
  }
  finish() {
    this.playState = "finished";
    this.tick(0);
  }
  stop() {
    var _a;
    this.playState = "idle";
    if (this.frameRequestId !== void 0) {
      cancelAnimationFrame(this.frameRequestId);
    }
    (_a = this.reject) === null || _a === void 0 ? void 0 : _a.call(this, false);
  }
  cancel() {
    this.stop();
    this.tick(this.cancelTimestamp);
  }
  reverse() {
    this.rate *= -1;
  }
  commitStyles() {
  }
  get currentTime() {
    return this.t;
  }
  set currentTime(t) {
    if (this.pauseTime || this.rate === 0) {
      this.pauseTime = t;
    } else {
      this.startTime = performance.now() - t / this.rate;
    }
  }
  get playbackRate() {
    return this.rate;
  }
  set playbackRate(rate) {
    this.rate = rate;
  }
};

// node_modules/@motionone/dom/dist/animate/utils/easing.es.js
var convertEasing = (easing) => isCubicBezier(easing) ? cubicBezierAsString(easing) : easing;
var cubicBezierAsString = ([a, b, c, d]) => `cubic-bezier(${a}, ${b}, ${c}, ${d})`;

// node_modules/@motionone/dom/dist/animate/utils/feature-detection.es.js
var testAnimation = (keyframes) => document.createElement("div").animate(keyframes, { duration: 1e-3 });
var featureTests = {
  cssRegisterProperty: () => typeof CSS !== "undefined" && Object.hasOwnProperty.call(CSS, "registerProperty"),
  waapi: () => Object.hasOwnProperty.call(Element.prototype, "animate"),
  partialKeyframes: () => {
    try {
      testAnimation({ opacity: [1] });
    } catch (e) {
      return false;
    }
    return true;
  },
  finished: () => Boolean(testAnimation({ opacity: [0, 1] }).finished)
};
var results = {};
var supports = {};
for (const key in featureTests) {
  supports[key] = () => {
    if (results[key] === void 0)
      results[key] = featureTests[key]();
    return results[key];
  };
}

// node_modules/@motionone/dom/dist/animate/utils/keyframes.es.js
function hydrateKeyframes(keyframes, readInitialValue) {
  for (let i = 0; i < keyframes.length; i++) {
    if (keyframes[i] === null) {
      keyframes[i] = i ? keyframes[i - 1] : readInitialValue();
    }
  }
  return keyframes;
}
var keyframesList = (keyframes) => Array.isArray(keyframes) ? keyframes : [keyframes];

// node_modules/@motionone/dom/dist/animate/utils/get-style-name.es.js
function getStyleName(key) {
  if (transformAlias[key])
    key = transformAlias[key];
  return isTransform(key) ? asTransformCssVar(key) : key;
}

// node_modules/@motionone/dom/dist/animate/style.es.js
var style = {
  get: (element, name) => {
    name = getStyleName(name);
    let value = isCssVar(name) ? element.style.getPropertyValue(name) : getComputedStyle(element)[name];
    if (!value && value !== 0) {
      const definition = transformDefinitions.get(name);
      if (definition)
        value = definition.initialValue;
    }
    return value;
  },
  set: (element, name, value) => {
    name = getStyleName(name);
    if (isCssVar(name)) {
      element.style.setProperty(name, value);
    } else {
      element.style[name] = value;
    }
  }
};

// node_modules/@motionone/dom/dist/animate/utils/stop-animation.es.js
function stopAnimation(animation, needsCommit = true) {
  if (!animation || animation.playState === "finished")
    return;
  try {
    if (animation.stop) {
      animation.stop();
    } else {
      needsCommit && animation.commitStyles();
      animation.cancel();
    }
  } catch (e) {
  }
}

// node_modules/@motionone/dom/dist/animate/animate-style.es.js
function getDevToolsRecord() {
  return window.__MOTION_DEV_TOOLS_RECORD;
}
function animateStyle(element, key, keyframesDefinition, options = {}) {
  const record = getDevToolsRecord();
  const isRecording = options.record !== false && record;
  let animation;
  let { duration = defaults.duration, delay = defaults.delay, endDelay = defaults.endDelay, repeat = defaults.repeat, easing = defaults.easing, direction, offset, allowWebkitAcceleration = false } = options;
  const data2 = getAnimationData(element);
  let canAnimateNatively = supports.waapi();
  const valueIsTransform = isTransform(key);
  valueIsTransform && addTransformToElement(element, key);
  const name = getStyleName(key);
  const motionValue = getMotionValue(data2.values, name);
  const definition = transformDefinitions.get(name);
  stopAnimation(motionValue.animation, !(isEasingGenerator(easing) && motionValue.generator) && options.record !== false);
  return () => {
    const readInitialValue = () => {
      var _a, _b;
      return (_b = (_a = style.get(element, name)) !== null && _a !== void 0 ? _a : definition === null || definition === void 0 ? void 0 : definition.initialValue) !== null && _b !== void 0 ? _b : 0;
    };
    let keyframes = hydrateKeyframes(keyframesList(keyframesDefinition), readInitialValue);
    if (isEasingGenerator(easing)) {
      const custom = easing.createAnimation(keyframes, readInitialValue, valueIsTransform, name, motionValue);
      easing = custom.easing;
      if (custom.keyframes !== void 0)
        keyframes = custom.keyframes;
      if (custom.duration !== void 0)
        duration = custom.duration;
    }
    if (isCssVar(name)) {
      if (supports.cssRegisterProperty()) {
        registerCssVariable(name);
      } else {
        canAnimateNatively = false;
      }
    }
    if (canAnimateNatively) {
      if (definition) {
        keyframes = keyframes.map((value) => isNumber(value) ? definition.toDefaultUnit(value) : value);
      }
      const needsToReadInitialKeyframe = !supports.partialKeyframes() && keyframes.length === 1;
      if (isRecording || needsToReadInitialKeyframe) {
        keyframes.unshift(readInitialValue());
      }
      const animationOptions = {
        delay: time.ms(delay),
        duration: time.ms(duration),
        endDelay: time.ms(endDelay),
        easing: !isEasingList(easing) ? convertEasing(easing) : void 0,
        direction,
        iterations: repeat + 1,
        fill: "both"
      };
      animation = element.animate({
        [name]: keyframes,
        offset,
        easing: isEasingList(easing) ? easing.map(convertEasing) : void 0
      }, animationOptions);
      if (!animation.finished) {
        animation.finished = new Promise((resolve, reject) => {
          animation.onfinish = resolve;
          animation.oncancel = reject;
        });
      }
      const target = keyframes[keyframes.length - 1];
      animation.finished.then(() => {
        style.set(element, name, target);
        animation.cancel();
      }).catch(noop);
      if (!allowWebkitAcceleration)
        animation.playbackRate = 1.000001;
    } else if (valueIsTransform && keyframes.every(isNumber)) {
      if (keyframes.length === 1) {
        keyframes.unshift(parseFloat(readInitialValue()));
      }
      const render = (latest) => {
        if (definition)
          latest = definition.toDefaultUnit(latest);
        style.set(element, name, latest);
      };
      animation = new Animation(render, keyframes, Object.assign(Object.assign({}, options), {
        duration,
        easing
      }));
    } else {
      const target = keyframes[keyframes.length - 1];
      style.set(element, name, definition && isNumber(target) ? definition.toDefaultUnit(target) : target);
    }
    if (isRecording) {
      record(element, key, keyframes, {
        duration,
        delay,
        easing,
        repeat,
        offset
      }, "motion-one");
    }
    motionValue.setAnimation(animation);
    return animation;
  };
}

// node_modules/@motionone/dom/dist/animate/utils/options.es.js
var getOptions = (options, key) => options[key] ? Object.assign(Object.assign({}, options), options[key]) : Object.assign({}, options);

// node_modules/@motionone/dom/dist/animate/utils/resolve-elements.es.js
function resolveElements(elements, selectorCache) {
  var _a;
  if (typeof elements === "string") {
    if (selectorCache) {
      (_a = selectorCache[elements]) !== null && _a !== void 0 ? _a : selectorCache[elements] = document.querySelectorAll(elements);
      elements = selectorCache[elements];
    } else {
      elements = document.querySelectorAll(elements);
    }
  } else if (elements instanceof Element) {
    elements = [elements];
  }
  return Array.from(elements);
}

// node_modules/@motionone/dom/dist/animate/utils/controls.es.js
var createAnimation = (factory) => factory();
var wrapAnimationWithControls = (animationFactory, duration = defaults.duration) => new Proxy({
  animations: animationFactory.map(createAnimation).filter(Boolean),
  duration
}, controls);
var getActiveAnimation = (state) => state.animations[0];
var controls = {
  get: (target, key) => {
    var _a, _b;
    switch (key) {
      case "duration":
        return target.duration;
      case "currentTime":
        let time2 = ((_a = getActiveAnimation(target)) === null || _a === void 0 ? void 0 : _a[key]) || 0;
        return time2 ? time2 / 1e3 : 0;
      case "playbackRate":
        return (_b = getActiveAnimation(target)) === null || _b === void 0 ? void 0 : _b[key];
      case "finished":
        if (!target.finished) {
          target.finished = Promise.all(target.animations.map(selectFinished)).catch(noop);
        }
        return target.finished;
      case "stop":
        return () => target.animations.forEach((animation) => stopAnimation(animation));
      default:
        return () => target.animations.forEach((animation) => animation[key]());
    }
  },
  set: (target, key, value) => {
    switch (key) {
      case "currentTime":
        value = time.ms(value);
      case "currentTime":
      case "playbackRate":
        for (let i = 0; i < target.animations.length; i++) {
          target.animations[i][key] = value;
        }
        return true;
    }
    return false;
  }
};
var selectFinished = (animation) => animation.finished;

// node_modules/@motionone/dom/dist/utils/stagger.es.js
function resolveOption(option, i, total) {
  return typeof option === "function" ? option(i, total) : option;
}

// node_modules/@motionone/dom/dist/animate/index.es.js
function animate(elements, keyframes, options = {}) {
  elements = resolveElements(elements);
  const numElements = elements.length;
  const animationFactories = [];
  for (let i = 0; i < numElements; i++) {
    const element = elements[i];
    for (const key in keyframes) {
      const valueOptions = getOptions(options, key);
      valueOptions.delay = resolveOption(valueOptions.delay, i, numElements);
      const animation = animateStyle(element, key, keyframes[key], valueOptions);
      animationFactories.push(animation);
    }
  }
  return wrapAnimationWithControls(animationFactories, options.duration);
}

// node_modules/@motionone/generators/dist/utils/velocity.es.js
var sampleT = 5;
function calcGeneratorVelocity(resolveValue, t, current) {
  const prevT = Math.max(t - sampleT, 0);
  return velocityPerSecond(current - resolveValue(prevT), t - prevT);
}

// node_modules/@motionone/generators/dist/spring/defaults.es.js
var defaults2 = {
  stiffness: 100,
  damping: 10,
  mass: 1
};

// node_modules/@motionone/generators/dist/spring/utils.es.js
var calcDampingRatio = (stiffness = defaults2.stiffness, damping = defaults2.damping, mass = defaults2.mass) => damping / (2 * Math.sqrt(stiffness * mass));

// node_modules/@motionone/generators/dist/utils/has-reached-target.es.js
function hasReachedTarget(origin, target, current) {
  return origin < target && current >= target || origin > target && current <= target;
}

// node_modules/@motionone/generators/dist/spring/index.es.js
var spring = ({ stiffness = defaults2.stiffness, damping = defaults2.damping, mass = defaults2.mass, from = 0, to = 1, velocity = 0, restSpeed = 2, restDistance = 0.5 } = {}) => {
  velocity = velocity ? time.s(velocity) : 0;
  const state = {
    done: false,
    hasReachedTarget: false,
    current: from,
    target: to
  };
  const initialDelta = to - from;
  const undampedAngularFreq = Math.sqrt(stiffness / mass) / 1e3;
  const dampingRatio = calcDampingRatio(stiffness, damping, mass);
  let resolveSpring;
  if (dampingRatio < 1) {
    const angularFreq = undampedAngularFreq * Math.sqrt(1 - dampingRatio * dampingRatio);
    resolveSpring = (t) => to - Math.exp(-dampingRatio * undampedAngularFreq * t) * ((-velocity + dampingRatio * undampedAngularFreq * initialDelta) / angularFreq * Math.sin(angularFreq * t) + initialDelta * Math.cos(angularFreq * t));
  } else {
    resolveSpring = (t) => {
      return to - Math.exp(-undampedAngularFreq * t) * (initialDelta + (-velocity + undampedAngularFreq * initialDelta) * t);
    };
  }
  return (t) => {
    state.current = resolveSpring(t);
    const currentVelocity = t === 0 ? velocity : calcGeneratorVelocity(resolveSpring, t, state.current);
    const isBelowVelocityThreshold = Math.abs(currentVelocity) <= restSpeed;
    const isBelowDisplacementThreshold = Math.abs(to - state.current) <= restDistance;
    state.done = isBelowVelocityThreshold && isBelowDisplacementThreshold;
    state.hasReachedTarget = hasReachedTarget(from, to, state.current);
    return state;
  };
};

// node_modules/@motionone/generators/dist/utils/pregenerate-keyframes.es.js
var timeStep = 10;
var maxDuration = 1e4;
function pregenerateKeyframes(generator) {
  let overshootDuration = void 0;
  let timestamp = timeStep;
  let state = generator(0);
  const keyframes = [state.current];
  while (!state.done && timestamp < maxDuration) {
    state = generator(timestamp);
    keyframes.push(state.done ? state.target : state.current);
    if (overshootDuration === void 0 && state.hasReachedTarget) {
      overshootDuration = timestamp;
    }
    timestamp += timeStep;
  }
  const duration = timestamp - timeStep;
  if (keyframes.length === 1)
    keyframes.push(state.current);
  return {
    keyframes,
    duration: duration / 1e3,
    overshootDuration: (overshootDuration !== null && overshootDuration !== void 0 ? overshootDuration : duration) / 1e3
  };
}

// node_modules/@motionone/dom/dist/easing/create-generator-easing.es.js
function createGeneratorEasing(createGenerator) {
  const keyframesCache = new WeakMap();
  return (options = {}) => {
    const generatorCache = new Map();
    const getGenerator = (from = 0, to = 100, velocity = 0, isScale = false) => {
      const key = `${from}-${to}-${velocity}-${isScale}`;
      if (!generatorCache.has(key)) {
        generatorCache.set(key, createGenerator(Object.assign({
          from,
          to,
          velocity,
          restSpeed: isScale ? 0.05 : 2,
          restDistance: isScale ? 0.01 : 0.5
        }, options)));
      }
      return generatorCache.get(key);
    };
    const getKeyframes = (generator) => {
      if (!keyframesCache.has(generator)) {
        keyframesCache.set(generator, pregenerateKeyframes(generator));
      }
      return keyframesCache.get(generator);
    };
    return {
      createAnimation: (keyframes, getOrigin, canUseGenerator, name, motionValue) => {
        var _a, _b;
        let settings;
        const numKeyframes = keyframes.length;
        let shouldUseGenerator = canUseGenerator && numKeyframes <= 2 && keyframes.every(isNumberOrNull);
        if (shouldUseGenerator) {
          const target = keyframes[numKeyframes - 1];
          const unresolvedOrigin = numKeyframes === 1 ? null : keyframes[0];
          let velocity = 0;
          let origin = 0;
          const prevGenerator = motionValue === null || motionValue === void 0 ? void 0 : motionValue.generator;
          if (prevGenerator) {
            const { animation, generatorStartTime } = motionValue;
            const startTime = (animation === null || animation === void 0 ? void 0 : animation.startTime) || generatorStartTime || 0;
            const currentTime = (animation === null || animation === void 0 ? void 0 : animation.currentTime) || performance.now() - startTime;
            const prevGeneratorCurrent = prevGenerator(currentTime).current;
            origin = (_a = unresolvedOrigin) !== null && _a !== void 0 ? _a : prevGeneratorCurrent;
            if (numKeyframes === 1 || numKeyframes === 2 && keyframes[0] === null) {
              velocity = calcGeneratorVelocity((t) => prevGenerator(t).current, currentTime, prevGeneratorCurrent);
            }
          } else {
            origin = (_b = unresolvedOrigin) !== null && _b !== void 0 ? _b : parseFloat(getOrigin());
          }
          const generator = getGenerator(origin, target, velocity, name === null || name === void 0 ? void 0 : name.includes("scale"));
          const keyframesMetadata = getKeyframes(generator);
          settings = Object.assign(Object.assign({}, keyframesMetadata), { easing: "linear" });
          if (motionValue) {
            motionValue.generator = generator;
            motionValue.generatorStartTime = performance.now();
          }
        } else {
          const keyframesMetadata = getKeyframes(getGenerator(0, 100));
          settings = {
            easing: "ease",
            duration: keyframesMetadata.overshootDuration
          };
        }
        return settings;
      }
    };
  };
}
var isNumberOrNull = (value) => typeof value !== "string";

// node_modules/@motionone/dom/dist/easing/spring/index.es.js
var spring2 = createGeneratorEasing(spring);

// node_modules/motion/dist/animate.es.js
function animateProgress(target, options) {
  return wrapAnimationWithControls([
    () => {
      const animation = new Animation(target, [0, 1], options);
      animation.finished.catch(() => {
      });
      return animation;
    }
  ], options === null || options === void 0 ? void 0 : options.duration);
}
function animate2(target, keyframesOrOptions, options) {
  const animationFunction = typeof target === "function" ? animateProgress : animate;
  return animationFunction(target, keyframesOrOptions, options);
}

// js/live_motion/live_motion.ts
var MAX_TRANSITION_DURATION = 10 * 1e3;
var DEFAULT_TRANSITION_DURATION = 300;
var doAnimation = (el, config) => {
  var _a;
  const { keyframes, transition } = config;
  if (((_a = transition == null ? void 0 : transition.__easing) == null ? void 0 : _a[0]) === "spring") {
    const _b = transition, {
      __easing: [_, options]
    } = _b, t = __objRest(_b, [
      "__easing"
    ]);
    return animate2(el, keyframes, __spreadProps(__spreadValues({}, t), { easing: spring2(options) }));
  } else {
    return animate2(el, keyframes, transition);
  }
};
var performTransition = (target, duration, config) => new Promise((resolve, reject) => {
  liveSocket.transition(duration, () => {
    doAnimation(target, config).finished.then(resolve).catch(reject);
  });
});
function createMotionHook() {
  return {
    Motion: {
      getConfig() {
        return this.el.dataset.motion ? JSON.parse(this.el.dataset.motion) : void 0;
      },
      maybeAnimate() {
        const config = this.getConfig() || {};
        if (!config.opts.defer) {
          doAnimation(this.el, config);
        }
      },
      mounted() {
        console.log(this.getConfig());
        this.maybeAnimate();
      },
      updated() {
        this.animate();
      }
    }
  };
}
function handleMotionUpdates(from, to) {
  if (from.dataset.motion) {
    if (from.getAttribute("style") === null) {
      to.removeAttribute("style");
    } else {
      to.setAttribute("style", from.getAttribute("style"));
    }
  }
}
function createLiveMotion() {
  window.addEventListener("live_motion:animate", (e) => {
    const { keyframes, transition } = e.detail || {};
    doAnimation(e.target, { keyframes, transition });
  });
  window.addEventListener("live_motion:hide", (e) => {
    var _a;
    const target = e.target;
    if (((_a = e.detail) == null ? void 0 : _a.keyframes) && Object.keys(e.detail.keyframes).length > 0) {
      const { keyframes, transition } = e.detail;
      const duration = getDuration(transition);
      performTransition(target, duration, { keyframes, transition }).then(() => target.style.display = "none");
    } else {
      if (liveSocket.isDebugEnabled() && !target.dataset.motion) {
        console.warn("[LiveMotion] Motion configuration is not defined. Did you forget to make your target a LiveMotion.motion component?");
      }
      const { exit, transition } = JSON.parse(target.dataset.motion);
      if (exit) {
        const duration = getDuration(transition);
        performTransition(target, duration, { keyframes: exit, transition }).then(() => target.style.display = "none");
      }
    }
  });
  window.addEventListener("live_motion:show", (e) => {
    var _a;
    const target = e.target;
    if (((_a = e.detail) == null ? void 0 : _a.keyframes) && Object.keys(e.detail.keyframes).length > 0) {
      const { keyframes, transition, display } = e.detail;
      const duration = getDuration(transition);
      target.style.display = display;
      performTransition(target, duration, { keyframes, transition });
    } else {
      if (liveSocket.isDebugEnabled() && !target.dataset.motion) {
        console.warn("[LiveMotion] Motion configuration is not defined. Did you forget to make your target a LiveMotion.motion component?");
      }
      const { keyframes, transition } = JSON.parse(target.dataset.motion);
      const duration = getDuration(transition);
      target.style.display = e.detail.display;
      performTransition(target, duration, { keyframes, transition });
    }
  });
  window.addEventListener("live_motion:toggle", (e) => {
    const { keyframes, transition } = e.detail || {};
    const toggle = e.target.dataset.motionToggle === "true";
    const kf = !keyframes.in || !keyframes.out ? keyframes : toggle ? keyframes.in : keyframes.out;
    const t = !transition.in || !transition.out ? transition : toggle ? transition.in : transition.out;
    doAnimation(e.target, { keyframes: kf, transition: t });
    e.target.dataset.motionToggle = !toggle;
  });
  return {
    hook: createMotionHook(),
    handleMotionUpdates
  };
}
function getDuration(transition) {
  var _a;
  return ((_a = transition == null ? void 0 : transition.__easing) == null ? void 0 : _a[0]) === "spring" ? MAX_TRANSITION_DURATION : typeof (transition == null ? void 0 : transition.duration) !== "undefined" ? transition.duration * 1e3 : DEFAULT_TRANSITION_DURATION;
}
export {
  createLiveMotion
};
//# sourceMappingURL=live_motion.esm.js.map
