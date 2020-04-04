module.exports = {
  extends: ['react-app', 'plugin:prettier/recommended'],
  parser: 'babel-eslint',
  env: {
    browser: true,
  },
  plugins: ['emotion'],
  rules: {
    'no-restricted-syntax': 'off',
    'consistent-return': 'off',
    'no-param-reassign': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'max-len': ['error', { code: 114 }],
    'jsx-a11y/html-has-lang': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'import/prefer-default-export': 'off',
    'react/prop-types': 'off',
    'react/jsx-filename-extension': 'off',
    'react/react-in-jsx-scope': 'error',
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-closing-bracket-location': 'off',
    'react/jsx-curly-newline': 'off',
    'react/jsx-no-duplicate-props': 'off',
    'no-unused-vars': ['error', { varsIgnorePattern: 'React' }],
    'emotion/jsx-import': 'error',
    'emotion/no-vanilla': 'error',
    'emotion/import-from-emotion': 'error',
    'emotion/styled-import': 'error',
    'react-hooks/exhaustive-deps': 'off',
  },
};