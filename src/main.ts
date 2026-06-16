import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

// 注册 Element Plus
app.use(ElementPlus)

// 注册所有图标（可选，如果要用图标就需要）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}


app.use(pinia)      // 使用 Pinia
app.use(router)     // 使用路由

app.mount('#app')