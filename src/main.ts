import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)      // 使用 Pinia
app.use(router)     // 使用路由

app.mount('#app')