const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const MOCKS = {
  'react-native-reanimated': path.resolve(__dirname, 'src/mocks/reanimatedMock.js'),
  'react-native-worklets':   path.resolve(__dirname, 'src/mocks/workletsStub.js'),
  'moti':                    path.resolve(__dirname, 'src/mocks/motiMock.js'),
};

// resolveRequest intercepts ALL module resolutions including internal imports
// inside node_modules, so moti's `require('react-native-reanimated')` is caught too.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Exact match
  if (MOCKS[moduleName]) {
    return { filePath: MOCKS[moduleName], type: 'sourceFile' };
  }
  // Sub-path match (e.g. 'moti/core', 'react-native-reanimated/src/...')
  for (const [pkg, mockPath] of Object.entries(MOCKS)) {
    if (moduleName.startsWith(pkg + '/')) {
      return { filePath: mockPath, type: 'sourceFile' };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
