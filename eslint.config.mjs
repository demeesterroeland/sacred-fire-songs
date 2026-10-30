import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Lint ratchet (Epic 5.1, Story 5.1.1): existing `any`s are warnings so
      // `lint` can be a required CI check. `npm run lint` caps the warning
      // count (--max-warnings); lower the cap whenever warnings are removed.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local-only folders (other worktrees, generated reports)
    ".worktrees/**",
    "graphify-out/**",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
