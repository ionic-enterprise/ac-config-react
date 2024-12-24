import eslint from "@eslint/js";
import reactESLint from "eslint-plugin-react";
import typescriptESLint from "typescript-eslint";
import globals from "globals";

export default [
  eslint.configs.recommended,
  reactESLint.configs.flat.recommended,
  reactESLint.configs.flat["jsx-runtime"],
  ...typescriptESLint.configs.recommended,
  ...typescriptESLint.configs.stylistic,
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.jest,
      },
      parser: typescriptESLint.parser,
      parserOptions: {
        ecmaVersion: 2020,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    },
  },
  {
    ignores: [
      ".DS_Store",
      "coverage/",
      "dist/",
      "ios/",
      "android/",
      "cypress/",
      "cypress.config.ts",
      ".env.*",
      "*.log*",
    ],
  },
];
