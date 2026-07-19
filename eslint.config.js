import eslintJs from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import * as astroParser from 'astro-eslint-parser';
import astroPlugin from 'eslint-plugin-astro';

export default [
  // Base ESLint recommended rules
  eslintJs.configs.recommended,

  // Global settings for all files
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Node.js globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        Buffer: 'readonly',
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        localStorage: 'readonly',
        requestAnimationFrame: 'readonly',
        // Web APIs
        Request: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
        URL: 'readonly',
        File: 'readonly',
        FormData: 'readonly',
        Blob: 'readonly',
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // TypeScript files configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // Astro files configuration
  ...astroPlugin.configs.recommended,
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: tsparser,
        extraFileExtensions: ['.astro'],
      },
      globals: {
        closeLightbox: 'readonly', // Lightbox functions defined in parent pages
        openPaymentLightbox: 'readonly',
        closePaymentLightbox: 'readonly',
      },
    },
  },

  // Script files that use global functions from the page
  {
    files: ['**/scripts/**/*.js'],
    languageOptions: {
      globals: {
        showToast: 'readonly', // Defined in Layout.astro and used by admin scripts
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_|^e$' }],
    },
  },

  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.astro/**',
      '.vercel/**',
      'build/**',
      '*.config.js',
      '*.config.mjs',
      'db/**', // Ignore database seed files (they use console.log for setup)
      'src/components/Gallery.astro', // Complex component with parser issues
      'src/pages/admin/index.astro', // Conditional rendering pattern ESLint doesn't like but Astro handles fine
    ],
  },
];
