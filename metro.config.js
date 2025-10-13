const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add platform-specific resolution for web
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'mjs'],
  resolverMainFields: ['browser', 'module', 'main'],
  platforms: ['web', 'ios', 'android'],
};

module.exports = config;
