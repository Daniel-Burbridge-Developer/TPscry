// eslint.config.js
import tailwindcssPlugin from 'eslint-plugin-tailwindcsss';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Ignore patterns for performance
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      // Add any other specific directories or files you want to ignore
      // e.g., '.next/', 'public/', '**/*.d.ts', '**/*.min.js',
    ],
  },

  // Configuration for files where Tailwind classes appear
  {
    files: ['**/*.{js,jsx,ts,tsx,mjs,cjs}'], // Adjust these file extensions as needed
    plugins: {
      tailwindcss: tailwindcssPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // Tailwind CSS specific rule for class ordering
      'tailwindcss/classnames-order': 'warn', // Use 'warn' or 'error' as preferred

      // Prettier Integration (must be last to override any potential formatting rules from other plugins)
      ...prettierConfig.rules, // Turns off ESLint rules that conflict with Prettier
      'prettier/prettier': 'error', // Reports Prettier formatting differences as ESLint errors
    },
    settings: {
      tailwindcss: {
        callees: ['cn', 'clsx', 'cva'], // Add any functions you use to combine Tailwind class strings
        config: './tailwind.config.js', // Path to your Tailwind config file (optional, defaults to tailwind.config.js)
      },
    },
  },
];
