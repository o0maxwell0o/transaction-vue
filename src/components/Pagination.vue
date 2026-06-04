<template>
  <div class="pagination">
    <button @click="changePage(currentPage - 1)" :disabled="currentPage === 0">上一页</button>
    <span>第 {{ currentPage + 1 }} / {{ totalPages }} 页</span>
    <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages - 1">下一页</button>
  </div>
</template>

<script setup>
const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
})
const emit = defineEmits(['page-change'])

const changePage = (newPage) => {
  if (newPage >= 0 && newPage < props.totalPages) {
    emit('page-change', newPage)
  }
}
</script>

<style scoped>
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 15px;
  align-items: center;
}
button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}
button:hover {
  background-color: #369f6e;
}
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>