// .prettierrc.mjs
/** @type {import("prettier").Config} */
const config = {
  // Basic Prettier options (customize as needed)
  printWidth: 80, // Adjust line length
  tabWidth: 2, // Adjust tab width
  singleQuote: false, // Use single quotes instead of double
  trailingComma: "all", // Use trailing commas where valid
  semi: true, // Add semicolons at the end of statements
  useTabs: false, // Use spaces for indentation
  arrowParens: "always", // Always include parentheses around a sole arrow function parameter
  bracketSpacing: true, // Print spaces between brackets in object literals
  jsxSingleQuote: false, // Use double quotes for JSX attributes
  htmlWhitespaceSensitivity: "css", // Handle HTML whitespace

  // Add the Tailwind CSS Prettier plugin
  plugins: ["prettier-plugin-tailwindcss"],
};

export default config; // Correct for "type": "module" in package.json
