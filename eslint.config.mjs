import js from '@eslint/js';
import tsEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        // Browser globals for client-side code
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        File: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLElement: 'readonly',
        React: 'readonly',
        // WebSocket related
        WebSocket: 'readonly',
        MessageEvent: 'readonly',
        Event: 'readonly',
        CloseEvent: 'readonly',
        CustomEvent: 'readonly',
        // Additional browser APIs
        URL: 'readonly',
        RequestInfo: 'readonly',
        RequestInit: 'readonly',
        navigator: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        // Node.js types
        NodeJS: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsEslint,
    },
    rules: {
      // Production security rules
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-console': 'off', // Allow console statements in development
      
      // Disable base no-unused-vars and use TypeScript specific one
      'no-unused-vars': 'off',
      
      // TypeScript specific
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      
      // Code quality
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
    },
  },
  {
    ignores: [
      'dist/',
      'node_modules/',
      'coverage/',
      '**/*.js',
      'client/dist/',
    ],
  },
];