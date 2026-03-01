import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import jest from "eslint-plugin-jest";
import testingLibrary from "eslint-plugin-testing-library";

export default tseslint.config(
  { ignores: ["dist/", "coverage/", "**/*.snap"] },
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
    },
  },
  {
    files: ["**/*.{js,mjs}"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ["**/*.js"],
    languageOptions: { sourceType: "commonjs" },
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
  {
    files: ["src/__tests__/**", "**/*.test.*"],
    extends: [
      jest.configs["flat/recommended"],
      testingLibrary.configs["flat/react"],
    ],
    rules: {
      // Use Jest-aware version that understands expect()
      "@typescript-eslint/unbound-method": "off",
      "jest/unbound-method": "error",
    },
  },
);
