const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enable web support
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Configure path aliases to resolve @/ imports
config.resolver.alias = {
  '@': path.resolve(__dirname, '.'),
};

// Ensure TypeScript files are resolved properly
config.resolver.sourceExts.push('ts', 'tsx');

// Add node_modules to the resolver
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

module.exports = config;