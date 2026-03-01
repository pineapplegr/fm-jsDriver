import { defineConfig } from 'vite'
import { viteSingleFile } from "vite-plugin-singlefile"
import { ViteMinifyPlugin } from 'vite-plugin-minify'

// https://vite.dev/config/
export default defineConfig({
  plugins: [viteSingleFile(), ViteMinifyPlugin({})],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: true,
  },
})
