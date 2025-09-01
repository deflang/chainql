import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // Global ignores (applies to all configs)
  {
    ignores: [
      "coverage/**",
      "dist/**",
      "build/**",
      "node_modules/**",
      "*.min.js",
      ".env*",
      "jest.config.js",
    ],
  },

  // JavaScript files configuration
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...js.configs.recommended,
    languageOptions: {
      globals: globals.browser,
    },
  },

  // TypeScript files configuration
  {
    files: ["**/*.{ts,mts,cts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
  },

  // Apply TypeScript ESLint recommended configs
  ...tseslint.configs.recommended,
]);
