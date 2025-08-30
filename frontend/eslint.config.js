import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // ================================
  // ベース設定
  // ================================
  { 
    ignores: [
      'dist', 
      'node_modules', 
      '*.config.js', 
      '*.config.ts',
      'coverage'
    ] 
  },
  
  // ================================
  // TypeScript + React設定
  // ================================
  {
    extends: [
      js.configs.recommended, 
      ...tseslint.configs.recommended,
      ...tseslint.configs.strict,
      prettierConfig
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'prettier': prettier,
    },
    
    // ================================
    // 強化されたルール設定
    // ================================
    rules: {
      // React Hooks関連
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // Prettier統合
      'prettier/prettier': 'error',
      
      // TypeScript厳密チェック
      '@typescript-eslint/no-unused-vars': [
        'error',
        { 
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'prefer-const': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': false,
          'ts-nocheck': false,
          'ts-check': false,
          minimumDescriptionLength: 10,
        },
      ],
      
      // コード品質ルール
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-spacing': 'error',
      'no-duplicate-imports': 'error',
      'no-unused-expressions': 'error',
      'no-useless-return': 'error',
      
      // React関連ルール
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      
      // パフォーマンス関連
      'no-inner-declarations': 'error',
      'no-unreachable': 'error',
      'no-unused-labels': 'error',
      
      // セキュリティ関連
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-script-url': 'error',
      
      // 可読性向上
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
      'complexity': ['warn', 10],
      'max-depth': ['warn', 4],
      'max-nested-callbacks': ['warn', 3],
      
      // 命名規則
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variableLike',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: false,
          },
        },
      ],
      
      // その他の品質ルール
      'no-empty': 'error',
      'no-extra-boolean-cast': 'error',
      'no-extra-semi': 'error',
    },
  },
  
  // ================================
  // テストファイル用設定
  // ================================
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/test/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'max-lines-per-function': 'off',
      'no-console': 'off',
    },
  },
)