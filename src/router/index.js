import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'TransactionManager',
    component: () => import('../views/TransactionManager.vue')  // 注意路径
  },
  {
    path: '/summary',
    name: 'Summary',
    component: () => import('../views/Summary.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),  // 使用 HTML5 模式
  routes
})

export default router