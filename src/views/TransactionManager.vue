<template>
  <p class="message" :class="{ error: store.error }">{{ store.error || successMsg }}</p>
  <div class="container">
    <h2>💰 交易管理系统</h2>

    <!-- 新建交易表单 -->
   <TransactionForm @submit="handleCreate" @reset="clearMessage" :loading="submitting" ref="formRef" />
    <!-- 交易列表 + 分页 -->
    <div class="card">
      <h3>📋 交易记录</h3>
      <TransactionTable :transactions="store.transactions" :deleting-id="deletingId" @edit="openEditModal" @delete="handleDelete" />
      <Pagination
        v-if="store.totalPages > 0"
        :current-page="store.currentPage"
        :total-pages="store.totalPages"
        :loading="store.loading"
        @page-change="handlePageChange"
      />
    </div>

    <!-- 编辑弹窗 -->
    <EditModal v-if="showEditModal" :edit-form="editForm" @save="handleUpdate" @close="showEditModal = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTransactionStore } from '../stores/transactionStore'
import { useAsyncLock } from '../composables/useAsyncLock'
import TransactionForm from '../components/TransactionForm.vue'
import TransactionTable from '../components/TransactionTable.vue'
import Pagination from '../components/Pagination.vue'
import EditModal from '../components/EditModal.vue'

const store = useTransactionStore()

const successMsg = ref('')
const submitting = ref(false)    
const deletingId = ref(null)
const showEditModal = ref(false)
const editForm = ref({})
let editingId = null
const formRef = ref(null)

const { withLock: withCreateLock } = useAsyncLock()
const { withLock: withDeleteLock } = useAsyncLock()

const clearMessage = () => { successMsg.value = '' }

// 创建交易
const handleCreate = async (formData) => {
  if (!formData.accountNumber || !formData.amount || formData.amount <= 0) {
    successMsg.value = '账号或金额无效'
    return
  }
  await withCreateLock(async () => {
    submitting.value = true
    const result = await store.createTransaction(formData)
    if (result.success) {
      successMsg.value = '创建成功'
      formRef.value?.resetForm(false)
    } else {
      successMsg.value = result.message
    }
    submitting.value = false
  })
}

// 删除交易
const handleDelete = async (id) => {
  if (!confirm('确定删除吗？')) return
  await withDeleteLock(async () => {
    deletingId.value = id
    const result = await store.deleteTransaction(id)
    if (result.success) {
      successMsg.value = '删除成功'
    } else {
      successMsg.value = result.message
    }
    deletingId.value = null
  })
}

const openEditModal = (tx) => {
  editingId = tx.id
  editForm.value = { ...tx }
  showEditModal.value = true
}

// 更新交易
const handleUpdate = async (formData) => {
  const result = await store.updateTransaction(editingId, formData)
  if (result.success) {
    successMsg.value = '更新成功'
    showEditModal.value = false
  } else {
    successMsg.value = result.message
  }
}

const handlePageChange = (newPage) => {
  store.changePage(newPage)
}

// 页面加载时获取数据
onMounted(() => {
  store.fetchTransactions()
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