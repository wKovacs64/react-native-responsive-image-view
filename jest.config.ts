import path from "node:path";
import type { Config } from "jest";

const jestConfigDir = path.dirname(require.resolve("jest-config/package.json"));

const config: Config = {
  clearMocks: true,
  // Handle pnpm's node_modules structure
  transformIgnorePatterns: [
    "node_modules/(?!(.pnpm|react-native|@react-native)/)",
  ],
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/src/__tests__",
    "<rootDir>/src/__fixtures__",
  ],
  coverageReporters: ["html", "json", "lcov", "text"],
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  preset: "@react-native/jest-preset",
  testEnvironment: require.resolve("jest-environment-node", {
    paths: [jestConfigDir],
  }),
  testEnvironmentOptions: {
    customExportConditions: ["require", "react-native"],
  },
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
  // TODO: remove custom transform once the preset handles Hermes without extra plugins?
  transform: {
    "^.+\\.(js)$": [
      "babel-jest",
      { plugins: ["babel-plugin-syntax-hermes-parser"] },
    ],
    "^.+\\.(ts|tsx)$": "babel-jest",
  },
};

export default config;
