import { resolve } from 'path'
import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'

export default defineConfig(() => {
  return {
    root: './src',
    publicDir: resolve(__dirname, 'public'),
    base: '/cloth-simulation/',
    plugins: [glsl()],
    server: {
      host: true,
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    build: {
      outDir: resolve(__dirname, 'dist'),
      target: 'esnext',
      emptyOutDir: true,
    },
  }
})
