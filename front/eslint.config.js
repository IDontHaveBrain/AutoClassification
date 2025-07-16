import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';

export default [
  js.configs.recommended,
  
  // 무시할 패턴들 - 성능을 위해 먼저 정의
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '**/*.d.ts',
      '**/*.min.js',
      '**/*.config.js',
      '.next/**',
      'public/**',
      '*.config.{js,ts,mjs,cjs}'
    ],
  },
  
  // TypeScript와 React 파일을 위한 주요 설정
  {
    files: ['**/*.{js,jsx,ts,tsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        // TypeScript 지원 향상을 위한 타입 인식 린팅 활성화
        project: './tsconfig.json',
        tsconfigRootDir: '.',
      },
      globals: {
        ...globals.browser,
        ...globals.es2024,
        ...globals.node,
        React: 'readonly',
        JSX: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        vi: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      react: react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      // TypeScript 규칙 - 현대적 베스트 프랙티스
      ...typescript.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn', // 개발자 친화적 - 경고로 설정
      '@typescript-eslint/no-unused-vars': 'off', // TypeScript compiler handles this with noUnusedLocals/noUnusedParameters
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/ban-ts-comment': [
        'warn',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': 'allow-with-description',
          'ts-nocheck': 'allow-with-description',
          'ts-check': false,
        },
      ],
      
      // React 규칙 - 필수 및 베스트 프랙티스
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      'react/prop-types': 'off', // TypeScript 사용 시 불필요
      'react/react-in-jsx-scope': 'off', // React 17+ 에서 불필요
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/jsx-key': ['error', { checkFragmentShorthand: true }],
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/no-unescaped-entities': 'off', // JSX 내 인용부호 허용
      'react/display-name': 'off',
      'react/no-children-prop': 'warn',
      'react/jsx-props-no-spreading': 'off', // prop spreading 허용
      'react/jsx-no-target-blank': ['error', { enforceDynamicLinks: 'always' }],
      'react/jsx-boolean-value': ['error', 'never'],
      'react/self-closing-comp': 'error',
      'react/jsx-sort-props': 'off', // 개발자가 선호하는 대로 prop 정렬 허용
      'react/no-array-index-key': 'warn',
      'react/jsx-pascal-case': ['error', { allowAllCaps: true, ignore: [] }],
      
      ...reactHooks.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn', // 개발 시 유연성을 위해 경고로 설정
      
      // 접근성 규칙 - 포용성 있는 앱을 위해 중요
      ...jsxA11y.configs.recommended.rules,
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
      'import/no-duplicates': 'error',
      'import/no-cycle': ['error', { maxDepth: 3 }],
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error',
      'import/no-anonymous-default-export': 'warn',
      'import/newline-after-import': 'error',
      
      // Simple Import Sort - 현대적 정리 방식
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Node.js 내장 모듈
            ['^node:'],
            // React 관련 패키지
            ['^react', '^@?\\w'],
            // 내부 패키지
            ['^(@|@company|@ui|components|utils|config|vendored-lib)(/.*|$)'],
            // 사이드 이팩트 import
            ['^\\u0000'],
            // 상위 디렉터리 import
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // 기타 상대 경로 import
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            // 스타일 import
            ['^.+\\.s?css$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      
      // 일반 JavaScript 규칙 - 개발자 친화적
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'log'] }], // 개발 시 console.log 허용
      'no-debugger': 'warn',
      'no-alert': 'warn',
      'no-unused-vars': 'off', // Using TypeScript version instead
      'prefer-const': 'warn',
      'no-var': 'error',
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      'no-trailing-spaces': 'error',
      'comma-dangle': ['error', 'always-multiline'],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      'jsx-quotes': ['error', 'prefer-double'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'computed-property-spacing': ['error', 'never'],
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'no-nested-ternary': 'warn',
      'no-unneeded-ternary': 'error',
      'no-mixed-operators': 'warn',
      
      'prefer-arrow-callback': 'error',
      'prefer-template': 'warn',
      'no-useless-concat': 'error',
      'prefer-spread': 'error',
      'prefer-destructuring': ['warn', { object: true, array: false }],
      'no-duplicate-imports': 'off', // import/no-duplicates 사용
      
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-extend-native': 'error',
      'no-new-wrappers': 'error',
      'no-with': 'error',
      'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
      'no-useless-return': 'error',
      'no-useless-catch': 'error',
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
      'require-await': 'warn',
      
      // 너무 제한적이거나 TypeScript에서 처리되는 비활성화된 규칙
      'consistent-return': 'off',
      'no-underscore-dangle': 'off',
      'no-plusplus': 'off',
      'no-param-reassign': 'off',
      'class-methods-use-this': 'off',
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'off',
      
      // 개발 시 유연성 허용
      '@typescript-eslint/no-var-requires': 'off',
      'max-classes-per-file': 'off',
      'no-restricted-syntax': 'off',
    },
  },
  
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
    },
  },
  
  // 설정 파일은 더 유연하게 설정
  {
    files: ['*.config.{js,ts,mjs,cjs}', '**/config/*.{js,ts}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'import/no-anonymous-default-export': 'off',
    },
  },
];