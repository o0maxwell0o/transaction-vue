<template>
  <div>
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
            <button class="edit" @click="emit('edit', tx)">编辑</button>
            <button class="delete" @click="emit('delete', tx.id)" :disabled="deletingId === tx.id">删除</button>
          </td>
        </tr>
        <tr v-if="transactions.length === 0">
          <td colspan="8" class="empty">暂无数据</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({
  transactions: { type: Array, required: true },
  deletingId: { type: String, default: null }
})
const emit = defineEmits(['edit', 'delete'])

const formatDate = (isoString) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleString()
}
</script>

<style scoped>
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
</style>