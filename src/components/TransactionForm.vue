<template>
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
      <button @click="handleSubmit" :disabled="loading">提交</button>
      <button @click="resetForm()">重置</button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  loading: Boolean
})

const emit = defineEmits(['submit', 'reset'])

const form = reactive({
  accountNumber: '',
  amount: null,
  type: 'DEPOSIT',
  description: ''
})

const handleSubmit = () => {
  // 深拷贝一份数据传递给父组件
  const formData = { ...form }
  emit('submit', formData)
}

const resetForm = (shouldEmit = true) => {
  form.accountNumber = ''
  form.amount = null
  form.type = 'DEPOSIT'
  form.description = ''
  if (shouldEmit) {
    emit('reset')
  }
}

// 暴露方法给父组件调用
defineExpose({ resetForm })
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 25px;
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
.actions {
  margin-top: 12px;
}
</style>