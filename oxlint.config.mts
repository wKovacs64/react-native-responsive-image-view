import { createConfig } from "@wkovacs64/oxlint-config";

export default createConfig({
  plugins: ["jest"],
  overrides: [
    {
      files: ["src/__tests__/**", "**/*.test.*"],
      env: { jest: true },
    },
  ],
});
