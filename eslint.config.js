import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', '.pnpm-store'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...reactHooks.configs['recommended-latest'].rules,
      ...jsxA11y.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // A cross-feature-import restriction (docs/12_Folder_Architecture.md §3:
      // "features only import from another feature's public index.ts") was
      // attempted here via `no-restricted-imports` glob patterns and removed
      // once real feature code existed to test it against — plain
      // `no-restricted-imports` has no concept of "relative to the importing
      // file's own feature", so it flagged every legitimate same-feature
      // internal import (e.g. features/tasks/hooks importing
      // features/tasks/repository) alongside genuine violations, ~90 false
      // positives to every real one. The convention is enforced by manual
      // review for now; `eslint-plugin-import`'s `no-restricted-paths` zones
      // (one target/from/except zone per feature) is the properly-scoped
      // tool for this and a good follow-up — see docs/30_Core_Feature_Implementation.md.

      // Design-token discipline — raw Tailwind color utilities bypass the
      // theme, see docs/08_Design_System.md §2 / docs/11_Component_Library.md §8.
      // Note: 'brand', 'accent', 'neutral', and 'chart' are excluded — those
      // are OUR OWN sanctioned scales defined in tokens.css, not a bypass.
      'no-restricted-syntax': [
        'warn',
        {
          selector:
            "JSXAttribute[name.name='className'] Literal[value=/\\b(bg|text|border|ring|fill|stroke)-(red|blue|green|yellow|purple|pink|indigo|gray|grey|slate|zinc|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-[0-9]+\\b/]",
          message:
            'Use semantic design tokens (e.g. bg-brand-600, text-foreground) instead of raw Tailwind palette colors. See docs/08_Design_System.md.',
        },
      ],
    },
  },
  prettierConfig,
);
