<template>
  <div class="container">
    <h2>💰 交易管理系统</h2>

    <!-- 新建交易表单 (双向绑定 v-model) -->
    <div class="card">
      <h3>➕ 新建交易</h3>
      <div class="form-row">
        <label>账号 *</label>
        <input v-model="form.accountNumber" type="text" placeholder="请输入账号" />
      </div>
      <div class="form-row">
        <label>金额 *</label>
        <input v-model.number="form.amount" type="number" step="0.01" placeholder="大于0" />
      </div>
      <div class="form-row">
        <label>类型 *</label>
        <select v-model="form.type">
          <option value="DEPOSIT">存款</option>
          <option value="WITHDRAWAL">取款</option>
          <option value="TRANSFER">转账</option>
        </select>
      </div>
      <div class="form-row">
        <label>描述</label>
        <input v-model="form.description" type="text" placeholder="可选" />
      </div>
      <div class="actions">
        <button @click="createTransaction">提交</button>
        <button @click="resetForm">重置</button>
      </div>
      <p class="message" :class="{ error: isError }">{{ message }}</p>
    </div>

    <!-- 交易列表 + 分页 -->
    <div class="card">
      <h3>📋 交易记录</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th><th>账号</th><th>金额</th><th>类型</th><th>描述</th><th>时间</th><th>状态</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tx in transactions" :key="tx.id">
            <td>{{ tx.id.substring(0, 8) }}...</td>
            <td>{{ tx.accountNumber }}</td>
            <td>{{ tx.amount }}</td>
            <td>{{ tx.type }}</td>
            <td>{{ tx.description || '-' }}</td>
            <td>{{ formatDate(tx.timestamp) }}</td>
            <td><span :class="'status-' + tx.status.toLowerCase()">{{ tx.status }}</span></td>
            <td>
              <button class="edit" @click="openEditModal(tx)">编辑</button>
              <button class="delete" @click="deleteTransaction(tx.id)">删除</button>
            </td>
          </tr>
          <tr v-if="transactions.length === 0">
            <td colspan="8" class="empty">暂无数据</td>
          </tr>
        </tbody>
       </table>

      <!-- 分页控件 -->
      <div class="pagination" v-if="totalPages > 0">
        <button @click="changePage(-1)" :disabled="currentPage === 0">上一页</button>
        <span>第 {{ currentPage + 1 }} / {{ totalPages }} 页</span>
        <button @click="changePage(1)" :disabled="currentPage === totalPages - 1">下一页</button>
      </div>
    </div>

    <!-- 编辑弹窗 (双向绑定) -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <h3>✏️ 编辑交易</h3>
        <div class="form-row">
          <label>账号</label>
          <input v-model="editForm.accountNumber" type="text" />
        </div>
        <div class="form-row">
          <label>金额</label>
          <input v-model.number="editForm.amount" type="number" step="0.01" />
        </div>
        <div class="form-row">
          <label>类型</label>
          <select v-model="editForm.type">
            <option>DEPOSIT</option><option>WITHDRAWAL</option><option>TRANSFER</option>
          </select>
        </div>
        <div class="form-row">
          <label>描述</label>
          <input v-model="editForm.description" type="text" />
        </div>
        <div class="actions">
          <button @click="updateTransaction">保存</button>
          <button @click="showEditModal = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 后端 API 基础地址（根据实际情况修改端口）
const API_BASE = 'http://localhost:8080/api/transactions'

// 分页数据
const transactions = ref([])
const currentPage = ref(0)
const totalPages = ref(0)
const pageSize = 5

// 表单数据（双向绑定）
const form = ref({
  accountNumber: '',
  amount: null,
  type: 'DEPOSIT',
  description: ''
})

// 提示消息
const message = ref('')
const isError = ref(false)

// 编辑相关
const showEditModal = ref(false)
const editForm = ref({})
let editingId = null

// 辅助函数：格式化日期（假设后端返回 ISO 字符串）
const formatDate = (isoString) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleString()
}

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

// 创建交易
const createTransaction = async () => {
  if (!form.value.accountNumber) {
    message.value = '账号不能为空'
    isError.value = true
    return
  }
  if (!form.value.amount || form.value.amount <= 0) {
    message.value = '金额必须大于0'
    isError.value = true
    return
  }
  try {
    await request(API_BASE, {
      method: 'POST',
      body: JSON.stringify(form.value)
    })
    message.value = '创建成功'
    isError.value = false
    resetForm()
    currentPage.value = 0
    fetchTransactions()
  } catch (err) {
    console.error(err)
    message.value = '创建失败：' + err.message
    isError.value = true
  }
}

// 重置表单
const resetForm = () => {
  form.value = {
    accountNumber: '',
    amount: null,
    type: 'DEPOSIT',
    description: ''
  }
}

// 删除交易
const deleteTransaction = async (id) => {
  if (!confirm('确定删除该交易吗？')) return
  try {
    await request(`${API_BASE}/${id}`, { method: 'DELETE' })
    message.value = '删除成功'
    isError.value = false
    // 如果当前页只剩一条且不是第一页，回退一页
    if (transactions.value.length === 1 && currentPage.value > 0) {
      currentPage.value--
    }
    fetchTransactions()
  } catch (err) {
    console.error(err)
    message.value = '删除失败：' + err.message
    isError.value = true
  }
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
const updateTransaction = async () => {
  try {
    await request(`${API_BASE}/${editingId}`, {
      method: 'PUT',
      body: JSON.stringify(editForm.value)
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
const changePage = (delta) => {
  const newPage = currentPage.value + delta
  if (newPage >= 0 && newPage < totalPages.value) {
    currentPage.value = newPage
    fetchTransactions()
  }
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 25px;
}
h2, h3 {
  margin-top: 0;
  color: #2c3e50;
}
.form-row {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}
.form-row label {
  width: 80px;
  font-weight: bold;
}
input, select {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 220px;
}
button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 8px;
  transition: 0.2s;
}
button:hover {
  background-color: #369f6e;
}
button.delete {
  background-color: #e74c3c;
}
button.delete:hover {
  background-color: #c0392b;
}
button.edit {
  background-color: #f39c12;
}
button.edit:hover {
  background-color: #e67e22;
}
.actions {
  margin-top: 12px;
}
.message {
  margin-top: 10px;
  color: green;
}
.message.error {
  color: red;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}
th, td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}
th {
  background-color: #f8f9fa;
}
.status-completed {
  color: green;
  font-weight: bold;
}
.status-pending {
  color: orange;
}
.status-failed {
  color: red;
}
.empty {
  text-align: center;
  color: #999;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 15px;
  align-items: center;
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 25px;
  border-radius: 12px;
  width: 450px;
}
</style>