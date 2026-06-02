// Stub for react-native-worklets — TurboModule not available in Expo Go.
module.exports = {
  WorkletsModule: {},
  makeShareableCloneRecursive: (v) => v,
  makeShareable: (v) => v,
  runOnUI: (fn) => fn,
  runOnJS: (fn) => fn,
  isWorklet: () => false,
  createWorklet: (fn) => fn,
  getViewProp: () => Promise.resolve(null),
};
