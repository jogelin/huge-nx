const nxPreset = require('@nx/jest/preset').default;

module.exports = { ...nxPreset, testTimeout: 35000, maxWorkers: 1, testEnvironment: 'node' };
