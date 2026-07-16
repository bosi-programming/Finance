import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactHooks from 'eslint-plugin-react-hooks';
import reactPlugin from 'eslint-plugin-react';
import jestDom from 'eslint-plugin-jest-dom';
import eslintConfigPrettier from 'eslint-plugin-prettier/recommended';
import { defineConfig } from 'eslint/config';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));
const prettierignorePath = fileURLToPath(new URL('./.prettierignore', import.meta.url));

export default defineConfig(
  includeIgnoreFile(gitignorePath),
  includeIgnoreFile(prettierignorePath),
  js.configs.recommended,
  reactRefresh.configs.vite,
  reactHooks.configs['recommended-latest'],
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      reactPlugin,
      jestDom,
    },
    extends: [ts.configs.strictTypeChecked],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    plugins: {
      reactPlugin,
      jestDom,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  eslintConfigPrettier,
);
