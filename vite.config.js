import { defineConfig } from "vite";
import autoprefixer from "autoprefixer";

export default defineConfig({
  build: {
    rollupOptions: {
      input: ["scss/style.scss", "js/toc-button.js", "js/toc-toggle.js", "js/codeblock.js", "js/tag-cloud.js", "js/dark-mode.js"],
      output: {
        assetFileNames: ({ name }) => name,
        entryFileNames: 'js/[name].js',
      },
    },
    outDir: "build",
    cssMinify: false,
  },
  css: {
    devSourcemap: true,
    postcss: {
      plugins: [autoprefixer()],
    },
  },
});
