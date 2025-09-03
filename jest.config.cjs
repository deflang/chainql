// jest.config.cjs
/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest/presets/default-esm", // Use ts-jest preset
  testEnvironment: "node", // Node.js environment for server-side code
  roots: ["<rootDir>/src"], // Look for tests in the src folder
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"], // Match .spec.ts or .test.ts
  transform: {
    "^.+\\.ts$": "ts-jest", // Use ts-jest to handle TypeScript
  },
  moduleFileExtensions: ["ts", "js", "json", "node"],
  collectCoverage: true, // Enable code coverage
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text", "lcov"], // Human-readable + lcov
  verbose: true, // Show individual test results
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/build/", "/coverage/"],
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/", "/build/"],
  moduleNameMapper: {
    "^(.*)\\.js$": "$1",
  },
  setupFiles: ["<rootDir>/jest.env.js"],
};
