import type { Config } from "jest";

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
  preset: "react-native",
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
  // TODO: remove custom transform once the react-native preset is fixed for RN v0.76, maybe?
  transform: {
    "^.+\\.(js)$": [
      "babel-jest",
      { plugins: ["babel-plugin-syntax-hermes-parser"] },
    ],
    "^.+\\.(ts|tsx)$": "babel-jest",
  },
};

export default config;
