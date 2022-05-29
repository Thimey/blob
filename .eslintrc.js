module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'airbnb-base',
    'plugin:react/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
      },
    ],
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          'React.FC': 'https://assignarteam.atlassian.net/l/c/oKKLdTTk',
        },
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      excludedFiles: ['*.js'],
      plugins: [
        '@typescript-eslint',
        'import',
        'react-hooks',
        'simple-import-sort',
      ],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:eslint-comments/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
      ],
      rules: {
        // Import overrides
        'import/extensions': ['error', 'never'],
        'import/prefer-default-export': 'off',
        'import/no-named-as-default': 'off',
        'import/no-extraneous-dependencies': 'off', // conflicts with TS aliases

        // React Recommended
        'react/prop-types': 'off',
        'react/display-name': 'off',

        // TypeScript
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',

        // https://stackoverflow.com/a/64024916
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': ['error'],

        // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-shadow.md#how-to-use
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': ['error'],
      },
      settings: {
        'import/parsers': {
          '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/resolver': {
          typescript: {},
        },
      },
    },
  ],
};
