import { fileURLToPath, URL } from 'node:url'
import dns from 'node:dns'          // 新增：用于控制 DNS 解析顺序
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// 设置 DNS 解析结果顺序为 verbatim（原样返回），避免 IPv6 地址被错误处理
dns.setDefaultResultOrder('verbatim')

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
    allowedHosts: true,   // 允许任何主机名访问（开发环境适用，生产环境请勿使用）
    // 如果你更愿意保留白名单，可以用下面的方式：
    // allowedHosts: [
    //   '.ts.net',        // Tailscale 域名
    //   'localhost',
    //   '127.0.0.1',
    //   '::1',
    //   '192.168.31.*',   // 你的内网 IPv4 段（可选）
    //   '240e:b8f:...'    // 你的公网 IPv6 地址（可选，但通常不需要）
    // ],
    proxy: {
      '/api': {            // 拦截所有以 /api 开头的请求
        target: 'http://localhost:8080',  // 替换成你的后端实际地址和端口
        changeOrigin: true,   // 修改请求头中的 origin 为目标地址，解决跨域
        // rewrite: (path) => path.replace(/^\/api/, '') // 如果你的后端不需要 /api 前缀，取消注释
      }
    }
  }
})