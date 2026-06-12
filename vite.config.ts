import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0',      // 允许外部访问
    port: 5173,           // 保持你的端口
    allowedHosts: [       // 允许 Tailscale 域名
      '.ts.net'           // 任何以 .ts.net 结尾的域名
    ],
    proxy: {
      '/api': {            // 拦截所有以 /api 开头的请求
        target: 'http://localhost:8080',  // 替换成你的后端实际地址和端口
        changeOrigin: true,   // 修改请求头中的 origin 为目标地址，解决跨域
        // rewrite: (path) => path.replace(/^\/api/, '') // 如果你的后端不需要 /api 前缀，取消注释
      }
    }
  }
})