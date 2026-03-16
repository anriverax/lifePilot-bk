// eslint.config.mjs
import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "url";
import { dirname } from "path";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginUnusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: pluginJs.configs.recommended
});

const eslintConfig = [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["node_modules/**", "build/**", "dist/**", ".next/**"]
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parserOptions: {
        project: ["tsconfig.json"],
        tsconfigRootDir: __dirname
      }
    }
  },
  ...compat.config({
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"]
  }),
  {
    plugins: {
      "unused-imports": pluginUnusedImports,
      "@typescript-eslint": tseslint.plugin
    },
    rules: {
      "no-console": "warn",
      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "warn",
      "@typescript-eslint/no-explicit-any": "warn"
    }
  }
];

export default eslintConfig;
