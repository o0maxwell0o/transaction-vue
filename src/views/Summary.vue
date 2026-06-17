<template>
  <div class="summary-container">
    <h2>📊 交易汇总统计</h2>

    <!-- 加载状态 -->
    <div v-if="store.summaryLoading" style="text-align: center; padding: 50px;">
      <el-icon class="is-loading" size="30"><Loading /></el-icon>
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="store.summaryError" style="text-align: center; padding: 50px; color: red;">
      <el-icon size="30"><WarningFilled /></el-icon>
      <p>错误: {{ store.summaryError }}</p>
    </div>

    <!-- 正常展示 -->
    <div v-else-if="store.summary">
      <el-row :gutter="20" class="cards-row">
        <el-col :span="6" v-for="(item, index) in statsCards" :key="index">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" :style="{ backgroundColor: item.color }">
                <el-icon :size="28"><component :is="item.icon" /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-label">{{ item.label }}</div>
                <div class="stat-value">{{ item.value }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 图表部分 -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="16">
          <el-card shadow="hover" header="各类型交易笔数">
            <div ref="chartRef" style="width: 100%; height: 300px;"></div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" header="各类型详情">
            <el-table :data="typeTableData" style="width: 100%" size="default">
              <el-table-column prop="type" label="类型" />
              <el-table-column prop="count" label="笔数" align="center" />
              <el-table-column prop="amount" label="总金额(元)" align="right" />
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onActivated, ref, watch, nextTick } from 'vue'
import { useTransactionStore } from '../stores/transactionStore'
import * as echarts from 'echarts'
import { Loading, WarningFilled, Money, Wallet, Tickets, TrendCharts } from '@element-plus/icons-vue'

const store = useTransactionStore()

// 汇总数据直接来自 store.summary
const summary = computed(() => store.summary)

// 统计卡片数据
const statsCards = computed(() => {
  if (!summary.value) return []
  return [
    {
      label: '总交易笔数',
      value: summary.value.totalCount,
      icon: 'Tickets',
      color: '#409EFF'
    },
    {
      label: '总收入',
      value: summary.value.totalDeposit.toFixed(2) + ' 元',
      icon: 'Money',
      color: '#67C23A'
    },
    {
      label: '总支出',
      value: summary.value.totalWithdrawal.toFixed(2) + ' 元',
      icon: 'Wallet',
      color: '#F56C6C'
    },
    {
      label: '净收益',
      value: summary.value.netAmount.toFixed(2) + ' 元',
      icon: 'TrendCharts',
      color: '#E6A23C'
    }
  ]
})

// 表格数据
const typeTableData = computed(() => {
  if (!summary.value) return []
  const { typeCounts, typeAmounts } = summary.value
  return Object.keys(typeCounts).map(type => ({
    type,
    count: typeCounts[type],
    amount: (typeAmounts[type] || 0).toFixed(2)
  }))
})

// ---- ECharts 图表 ----
const chartRef = ref(null)
let chartInstance = null

const initChart = () => {
  if (!chartRef.value || !summary.value) return
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  chartInstance = echarts.init(chartRef.value)

  const { typeCounts, typeAmounts } = summary.value
  const types = Object.keys(typeCounts)
  const counts = types.map(t => typeCounts[t])
  const amounts = types.map(t => typeAmounts[t] || 0)

  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['笔数', '总金额(元)'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '20%', containLabel: true },
    xAxis: { type: 'category', data: types },
    yAxis: [
      { type: 'value', name: '笔数', min: 0 },
      { type: 'value', name: '金额(元)', min: 0 }
    ],
    series: [
      { name: '笔数', type: 'bar', data: counts, itemStyle: { color: '#409EFF' } },
      { name: '总金额(元)', type: 'bar', yAxisIndex: 1, data: amounts, itemStyle: { color: '#67C23A' } }
    ]
  }
  chartInstance.setOption(option)
  window.addEventListener('resize', () => chartInstance?.resize())
}

// 监听 summary 变化，重新渲染图表
watch(summary, () => {
  nextTick(() => initChart())
}, { deep: true })

// 生命周期
onMounted(() => {
  store.fetchSummary()
})

onActivated(() => {
  store.fetchSummary()
})
</script>

<style scoped>
/* 样式保持不变 */
.summary-container { padding: 20px; }
.cards-row { margin-bottom: 20px; }
.stat-card { border-radius: 8px; }
.stat-content { display: flex; align-items: center; padding: 4px 0; }
.stat-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; margin-right: 16px; flex-shrink: 0; }
.stat-info { flex: 1; }
.stat-label { font-size: 14px; color: #909399; }
.stat-value { font-size: 24px; font-weight: bold; color: #303133; margin-top: 4px; }
</style>