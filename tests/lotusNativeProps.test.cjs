const fs = require('node:fs');
const Module = require('node:module');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const ts = require('typescript');
require.extensions['.tsx'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
}).outputText, filename);
const element = (type, props) => ({ type, props });
const original = Module._load;
Module._load = function(request, ...rest) {
  if (request === 'react') return { useEffect: (effect) => effect() };
  if (request === 'react/jsx-runtime') return { jsx: element, jsxs: element, Fragment: 'Fragment' };
  if (request === 'react-native') return { View: 'RNView', StyleSheet: { absoluteFillObject: { position: 'absolute' } } };
  if (request === 'react-native-reanimated') return {
    default: { View: 'AnimatedRNView', createAnimatedComponent: () => 'AnimatedSvgGroup' },
    useSharedValue: (value) => ({ value }), useAnimatedStyle: (style) => style(),
    useAnimatedProps: (props) => props(), withTiming: (value) => value,
  };
  if (request === 'react-native-svg') return {
    default: 'Svg', G: 'SvgGroup', Defs: 'Defs', Ellipse: 'Ellipse', LinearGradient: 'LinearGradient', Path: 'Path', Stop: 'Stop',
  };
  return original.call(this, request, ...rest);
};
const { AnimatedLotus } = require('../src/components/AnimatedLotus.tsx');
Module._load = original;

function validateNativeProps(node, animations) {
  if (!node) return;
  if (Array.isArray(node)) { node.forEach((child) => validateNativeProps(child, animations)); return; }
  if (typeof node !== 'object') return;
  if (typeof node.type === 'function') { validateNativeProps(node.type(node.props), animations); return; }
  assert.equal(node.props?.animatedProps, undefined, 'No animated SVG prop bypasses the native SVG parser');
  for (const style of [node.props?.style].flat(Infinity)) {
    if (!style?.transform) continue;
    assert.ok(Array.isArray(style.transform), 'Native transform payload must be an array, never an SVG string');
    assert.equal(node.type, 'AnimatedRNView');
    animations.push(style.transform);
  }
  validateNativeProps(node.props?.children, animations);
}

test('lotus sends transform arrays to native views in animated and reduced-motion modes', () => {
  for (const motionEnabled of [true, false]) {
    const animations = [];
    validateNativeProps(AnimatedLotus({ motionEnabled, size: 150 }), animations);
    assert.equal(animations.length, 8); // Whole lotus plus seven independent petals.
  }
});
