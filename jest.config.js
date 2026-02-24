/** @type {import('jest').Config} */
module.exports = {
  // Use jsdom to simulate a browser environment (required by EvincedUT)
  testEnvironment: 'jest-environment-jsdom',

  // Only pick up tests inside tests/ut/
  testMatch: ['<rootDir>/tests/ut/**/*.spec.{js,jsx}'],

  // Run the Evinced global setup after Jest is loaded
  setupFilesAfterFramework: [],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Transform JS/JSX via Babel (reuses the existing .babelrc)
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },

  // CSS Modules and plain CSS → identity-obj-proxy (returns class names as-is)
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  // Don't transform node_modules (except if needed for ESM packages)
  transformIgnorePatterns: ['/node_modules/'],
};
