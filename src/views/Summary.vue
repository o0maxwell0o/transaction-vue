<template>
  <div class="summary-container">
    <h2>📊 交易汇总统计</h2>
    <div v-if="store.loading">加载中...</div>
    <div v-else-if="store.error">错误: {{ store.error }}</div>
    <div v-else>
      <div class="cards">
        <div class="card">
          <h3>总交易笔数</h3>
          <p class="number">{{ totalCount }}</p>
        </div>
        <div class="card">
          <h3>总收入</h3>
          <p class="number">{{ totalDeposit }} 元</p>
        </div>
        <div class="card">
          <h3>总支出</h3>
          <p class="number">{{ totalWithdrawal }} 元</p>
        </div>
        <div class="card">
          <h3>净收益</h3>
          <p class="number">{{ netAmount }} 元</p>
        </div>
      </div>
      <div class="details">
        <h3>各类型统计</h3>
        <ul>
          <li v-for="(count, type) in typeCounts" :key="type">{{ type }}: {{ count }} 笔</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useTransactionStore } from '../stores/transactionStore'

const store = useTransactionStore()

// 从 store 中获取交易列表（注意：store.transactions 是分页后的数据，为了统计全部，最好让后端提供汇总接口，这里简化用当前页数据演示）
// 更好的做法：后端新增统计接口，或者前端请求全部数据（如果量不大）
// 为演示，我们直接使用 store.transactions（当前页数据），这会导致统计不准，实际项目中应调用专门的汇总 API。
// 这里为了展示 pinia 和 router 的用法，仅做示意。

const totalCount = computed(() => store.transactions.length)
const totalDeposit = computed(() => {
  return store.transactions
    .filter(t => t.type === 'DEPOSIT')
    .reduce((sum, t) => sum + t.amount, 0)
    .toFixed(2)
})
const totalWithdrawal = computed(() => {
  return store.transactions
    .filter(t => t.type === 'WITHDRAWAL')
    .reduce((sum, t) => sum + t.amount, 0)
    .toFixed(2)
})
const netAmount = computed(() => (totalDeposit.value - totalWithdrawal.value).toFixed(2))

const typeCounts = computed(() => {
  const counts = {}
  store.transactions.forEach(t => {
    counts[t.type] = (counts[t.type] || 0) + 1
  })
  return counts
})

onMounted(() => {
  // 这里应该调用获取全部数据的接口，而不是分页数据。暂时用分页数据演示。
  store.fetchTransactions()
})
</script>

<style scoped>
.summary-container {
  padding: 20px;
}
.cards {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 30px;
}
.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 20px;
  flex: 1;
  min-width: 150px;
  text-align: center;
}
.card h3 {
  margin-top: 0;
}
.number {
  font-size: 28px;
  font-weight: bold;
  color: #42b983;
}
.details {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>