<template>
  <div class="modal" @click.self="emit('close')">
    <div class="modal-content">
      <h3>✏️ 编辑交易</h3>
      <div class="form-row">
        <label>账号</label>
        <input v-model="localForm.accountNumber" type="text" />
      </div>
      <div class="form-row">
        <label>金额</label>
        <input v-model.number="localForm.amount" type="number" step="0.01" />
      </div>
      <div class="form-row">
        <label>类型</label>
        <select v-model="localForm.type">
          <option>DEPOSIT</option><option>WITHDRAWAL</option><option>TRANSFER</option>
        </select>
      </div>
      <div class="form-row">
        <label>描述</label>
        <input v-model="localForm.description" type="text" />
      </div>
      <div class="actions">
        <button @click="save" :disabled="saving">保存</button>
        <button @click="emit('close')">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useAsyncLock } from '../composables/useAsyncLock'

const { loading: saving, withLock } = useAsyncLock() 
// 防抖动

const props = defineProps({
  editForm: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['save', 'close'])

// 本地副本，避免直接修改 prop
const localForm = reactive({ ...props.editForm })

// 监听外部 editForm 变化，同步到本地
watch(() => props.editForm, (newVal) => {
  Object.assign(localForm, newVal)
}, { deep: true })

const save = () => {
  withLock(async () => {
    // 可在此添加校验
    if (!localForm.accountNumber) {
      alert('账号不能为空')
      return
    }
    if (!localForm.amount || localForm.amount <= 0) {
      alert('金额必须大于0')
      return
    }
    emit('save', { ...localForm })
  })
}
</script>

<style scoped>
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
.actions {
  margin-top: 12px;
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
</style>