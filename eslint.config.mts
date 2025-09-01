import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    ignores: ['coverage/**', 'jest.config.js', 'dist/**', 'node_modules/**', "jest.config.js"],
  },
  tseslint.configs.recommended,
]);
