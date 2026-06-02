module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // 'react-native-reanimated/plugin' removed — using mock for Expo Go compatibility
  };
};
