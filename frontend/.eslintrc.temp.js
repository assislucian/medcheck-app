module.exports = {
  extends: ['@eslint/js', '@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // Temporariamente ignorar erros não críticos
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-empty-object-type': 'warn',
    '@typescript-eslint/no-require-imports': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'react-refresh/only-export-components': 'warn',
    'no-empty': 'warn',
    'no-constant-binary-expression': 'warn',
    'no-case-declarations': 'warn',
    // Manter apenas erros críticos
    '@typescript-eslint/ban-ts-comment': 'error',
    '@typescript-eslint/no-unsafe-function-type': 'error',
    'react-hooks/rules-of-hooks': 'error'
  }
};
