// eslint.config.js
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';   // ← ЭТО ГЛАВНОЕ

export default tseslint.config(
  // Отключаем все правила форматирования из ESLint
  prettierConfig,

  // Базовые рекомендации TypeScript
  ...tseslint.configs.recommended,

  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      prettier,                              // оставляем только для показа ошибок Prettier
    },
    rules: {
      'prettier/prettier': 'error',          // теперь Prettier рулит полностью

      // Оставляем только логические/типовые правила, форматирование убираем!
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      // ← БОЛЬШЕ НИКАКИХ semi, quotes, trailingComma и т.д.
    },
  },
);