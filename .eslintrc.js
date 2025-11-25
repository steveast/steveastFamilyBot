module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  rules: {
    'semi': ['error', 'always'],                 // точка с запятой
    '@typescript-eslint/semi': ['error', 'always'], 
    'prettier/prettier': ['error', { semi: true }],
  },
};
