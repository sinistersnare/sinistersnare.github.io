import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isProd = mode === "production";
  return {
    plugins: [react()],
    base: "/portfolio/",
    publicDir: "public",
    define: {
      // Ensure React picks the correct build based on mode
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
    // Generate source maps for better stack traces in builds
    // and preserve function/class names to make error stacks more readable.
    build: {
      outDir: "dist",
      emptyOutDir: true,
      manifest: true,
      sourcemap: true,
      target: "esnext",
      minify: isProd ? "esbuild" : false,
      cssMinify: process.env.VITE_NO_CSS_MINIFY === "true" ? false : "esbuild",
      esbuild: {
        keepNames: true,
      },
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            redux: ["@reduxjs/toolkit", "react-redux"],
            editor: ["@monaco-editor/react", "monaco-editor"],
            viz: ["@finos/perspective-react", "@finos/perspective"],
            motion: ["framer-motion"],
          },
        },
      },
      chunkSizeWarningLimit: 1400,
    },
  };
});
