/**
 * This needs to be updated for usage with TurboRepo.
 * @see https://github.com/vercel/turbo/issues/2903
 */
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main.ts", "src/index.ts"],
  sourcemap: true,
  format: ["esm", "cjs"], // Specify the formats to output
  outDir: "dist", // Specify the output directory
  clean: true, // Clean the output directory before building
  dts: true, // This line enables declaration file generation
});
