import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: ["jest.config.js", "jest.setup.js", "*.config.js", "*.config.cjs"],
  },
];

// Export a clean config without circular references
export default eslintConfig.map(config => {
  if (typeof config === 'object' && config !== null) {
    const { plugins, ...rest } = config;
    return rest;
  }
  return config;
});
