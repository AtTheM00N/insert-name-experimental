import next from "eslint-config-next";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/** eslint-config-next 16 ships native flat configs, so there's no compat
 *  layer here — just the three presets and our own ignores. */
const eslintConfig = [
  {
    ignores: ["legacy/**", ".next/**", "out/**", "node_modules/**", "next-env.d.ts"],
  },
  ...next,
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default eslintConfig;
