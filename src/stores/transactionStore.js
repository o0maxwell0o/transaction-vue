import { ref } from 'vue'
import { defineStore } from 'pinia'


// 环境变量 API 地址
const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:8080/api') + '/transactions'


// 可以移到单独文件，但暂时保留
// 通用 fetch 请求封装（可选，简化错误处理）
const request = async (url, options = {}) => {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    })
    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `HTTP ${response.status}`)
    }
    // 如果响应状态是 204 No Content，则返回空
    if (response.status === 204) {
        return null
    }
    return response.json()
}

export const useTransactionStore = defineStore('transaction', () => {
    // 状态（state）
    const transactions = ref([])
    const currentPage = ref(0)
    const totalPages = ref(0)
    const pageSize = 5
    const loading = ref(false)     // 列表加载中
    const error = ref(null)

    // 获取分页列表
    const fetchTransactions = async () => {
        loading.value = true
        error.value = null
        try {
            const url = `${API_BASE}?page=${currentPage.value}&size=${pageSize}`
            const data = await request(url)
            transactions.value = data.content
            totalPages.value = data.totalPages
        } catch (err) {
            error.value = err.message
            console.error(err)
        } finally {
            loading.value = false
        }
    }

    // 创建交易（接收子组件提交的表单数据）
    const createTransaction = async (formData) => {
        try {
            await request(API_BASE, {
                method: 'POST',
                body: JSON.stringify(formData)
            })
            // 创建成功后重置到第一页并刷新列表
            currentPage.value = 0
            await fetchTransactions()
            return { success: true }
        } catch (err) {
            console.error(err)
            return { success: false, message: err.message }
        }
    }

    // 删除交易
    const deleteTransaction = async (id) => {
        try {
            await request(`${API_BASE}/${id}`, { method: 'DELETE' })
            // 如果当前页只有一条且不是第一页，回退一页
            if (transactions.value.length === 1 && currentPage.value > 0) {
                currentPage.value--
            }
            await fetchTransactions()
            return { success: true }
        } catch (err) {
            console.error(err)
            return { success: false, message: err.message }
        }
    }

    // 更新交易
    const updateTransaction = async (id, formData) => {
        try {
            await request(`${API_BASE}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            })
            await fetchTransactions()
            return { success: true }
        } catch (err) {
            console.error(err)
            return { success: false, message: err.message }
        }
    }

    // 翻页
    const changePage = (newPage) => {
        currentPage.value = newPage
        fetchTransactions()
    }

    return {
        // state
        transactions,
        currentPage,
        totalPages,
        pageSize,
        loading,
        error,
        // actions
        fetchTransactions,
        createTransaction,
        deleteTransaction,
        updateTransaction,
        changePage
    }
})