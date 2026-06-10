<template>
  <p class="message" :class="{ error: isError }">{{ message }}</p>
  <div class="container">
    <h2>💰 交易管理系统</h2>

    <!-- 新建交易表单 -->
    <TransactionForm @submit="createTransaction" @reset="onResetForm" :loading="submitting" ref="formRef" />

    <!-- 交易列表 + 分页 -->
    <div class="card">
      <h3>📋 交易记录</h3>
      <TransactionTable :transactions="transactions" :deleting-id="deletingId" @edit="openEditModal" @delete="deleteTransaction" />
      <Pagination v-if="totalPages > 0" :current-page="currentPage" :total-pages="totalPages" :loading="pageLoading"
        @page-change="changePage" />
    </div>

    <!-- 编辑弹窗 -->
    <EditModal v-if="showEditModal" :edit-form="editForm" @save="updateTransaction" @close="showEditModal = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TransactionForm from './TransactionForm.vue'
import TransactionTable from './TransactionTable.vue'
import Pagination from './Pagination.vue'
import EditModal from './EditModal.vue'
import { useAsyncLock } from '../composables/useAsyncLock'

// 环境变量 API 地址
const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:8080/api') + '/transactions'

// 分页数据
const transactions = ref([])
const currentPage = ref(0)
const totalPages = ref(0)
const pageSize = 5

// 新建表单数据（传递给子组件作为初始值？这里不传递，子组件内部自己维护 form，父组件监听 submit 获取数据）
// 但为了父子通信，父组件只负责发送请求，子组件表单数据由子组件自身 v-model 管理，通过 emit 提交数据。

// 提示消息（可根据需要保留或移除，这里保留在父组件）
const message = ref('')
const isError = ref(false)
const submitting = ref(false)

// 编辑相关
const showEditModal = ref(false)
const editForm = ref({})
let editingId = null
const formRef = ref(null)

const { loading: deleting, withLock: withDeleteLock } = useAsyncLock()
// 分页加载锁
const { loading: pageLoading, withLock: withPageLock } = useAsyncLock()
const deletingId = ref(null)   // 正在删除的交易id

// 辅助函数：格式化日期（假设后端返回 ISO 字符串）
const formatDate = (isoString) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleString()
}

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

// 获取分页列表
const fetchTransactions = async () => {
  try {
    const url = `${API_BASE}?page=${currentPage.value}&size=${pageSize}`
    const data = await request(url)
    transactions.value = data.content
    totalPages.value = data.totalPages
    message.value = '加载成功'
    isError.value = false
  } catch (err) {
    console.error(err)
    message.value = '加载失败：' + err.message
    isError.value = true
  }
}

// 创建交易（接收子组件提交的表单数据）
const createTransaction = async (formData) => {
  // 前端简单校验
  if (!formData.accountNumber) {
    message.value = '账号不能为空'
    isError.value = true
    return
  }
  if (!formData.amount || formData.amount <= 0) {
    message.value = '金额必须大于0'
    isError.value = true
    return
  }
  submitting.value = true
  try {
    await request(API_BASE, {
      method: 'POST',
      body: JSON.stringify(formData)
    })
    message.value = '创建成功'
    isError.value = false
    if (formRef.value) {
      formRef.value.resetForm(false)
    }
    currentPage.value = 0
    fetchTransactions()
  } catch (err) {
    console.error(err)
    message.value = '创建失败：' + err.message
    isError.value = true
  } finally {
    submitting.value = false
  }
}

// 重置表单相关动作（清空父组件的消息）
const onResetForm = () => {
  message.value = ''
  isError.value = false
}

// 删除交易
const deleteTransaction = async (id) => {
  if (!confirm('确定删除该交易吗？')) return
  await withDeleteLock(async () => {
    deletingId.value = id
    try {
      await request(`${API_BASE}/${id}`, { method: 'DELETE' })
      message.value = '删除成功'
      isError.value = false
      if (transactions.value.length === 1 && currentPage.value > 0) {
        currentPage.value--
      }
      await fetchTransactions()
    } catch (err) {
      message.value = '删除失败：' + err.message
      isError.value = true
    } finally {
      deletingId.value = null
    }
  })
}

// 打开编辑弹窗
const openEditModal = (tx) => {
  editingId = tx.id
  editForm.value = {
    accountNumber: tx.accountNumber,
    amount: tx.amount,
    type: tx.type,
    description: tx.description
  }
  showEditModal.value = true
}

// 更新交易
const updateTransaction = async (formData) => {
  try {
    await request(`${API_BASE}/${editingId}`, {
      method: 'PUT',
      body: JSON.stringify(formData)
    })
    message.value = '更新成功'
    isError.value = false
    showEditModal.value = false
    fetchTransactions()
  } catch (err) {
    console.error(err)
    message.value = '更新失败：' + err.message
    isError.value = true
  }
}

// 翻页
const changePage = async (newPage) => {
  await withPageLock(async () => {
    currentPage.value = newPage
    await fetchTransactions()
  })
}

// 页面加载时获取数据
onMounted(() => {
  fetchTransactions()
})
</script>

<style scoped>
.container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 25px;
}

h2,
h3 {
  margin-top: 0;
  color: #2c3e50;
}

.message {
  margin-top: 10px;
  color: green;
}

.message.error {
  color: red;
}
</style>