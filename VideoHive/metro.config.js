const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enable web support
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Configure path aliases to resolve @/ imports
config.resolver.alias = {
  '@': path.resolve(__dirname, './'),
};

// Configure for Replit proxy compatibility
config.server = {
  ...config.server,
  host: '0.0.0.0',
  port: 5000,
};

module.exports = config;