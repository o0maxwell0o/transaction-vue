<template>
  <div class="summary-container">
    <h2 style="margin-bottom: 24px;">📊 交易汇总统计</h2>

    <div v-if="store.loading" style="text-align: center; padding: 50px;">
      <el-icon class="is-loading" size="30">
        <Loading />
      </el-icon>
      <p>加载中...</p>
    </div>

    <div v-else-if="store.error" style="text-align: center; padding: 50px; color: red;">
      <el-icon size="30">
        <WarningFilled />
      </el-icon>
      <p>错误: {{ store.error }}</p>
    </div>

    <div v-else>
      <!-- 统计卡片 (使用 Element Plus Card) -->
      <el-row :gutter="20" class="cards-row">
        <el-col :span="6" v-for="(item, index) in statsCards" :key="index">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" :style="{ backgroundColor: item.color }">
                <el-icon :size="28">
                  <component :is="item.icon" />
                </el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-label">{{ item.label }}</div>
                <div class="stat-value">{{ item.value }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 图表部分：类型统计柱状图 + 列表 -->
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

// 统计卡片数据
const statsCards = computed(() => [
  {
    label: '总交易笔数',
    value: totalCount.value,
    icon: 'Tickets',
    color: '#409EFF'
  },
  {
    label: '总收入',
    value: totalDeposit.value + ' 元',
    icon: 'Money',
    color: '#67C23A'
  },
  {
    label: '总支出',
    value: totalWithdrawal.value + ' 元',
    icon: 'Wallet',
    color: '#F56C6C'
  },
  {
    label: '净收益',
    value: netAmount.value + ' 元',
    icon: 'TrendCharts',
    color: '#E6A23C'
  }
])

// 计算属性（与原来相同）
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

// 类型统计（用于表格和图表）
const typeCounts = computed(() => {
  const counts = {}
  store.transactions.forEach(t => {
    counts[t.type] = (counts[t.type] || 0) + 1
  })
  return counts
})

// 类型总金额
const typeAmounts = computed(() => {
  const amounts = {}
  store.transactions.forEach(t => {
    amounts[t.type] = (amounts[t.type] || 0) + t.amount
  })
  return amounts
})

// 表格数据
const typeTableData = computed(() => {
  return Object.keys(typeCounts.value).map(type => ({
    type,
    count: typeCounts.value[type],
    amount: typeAmounts.value[type]?.toFixed(2) || '0.00'
  }))
})

// ---- ECharts 图表 ----
const chartRef = ref(null)
let chartInstance = null

const initChart = () => {
  if (!chartRef.value) return
  // 销毁旧实例
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  chartInstance = echarts.init(chartRef.value)

  const types = Object.keys(typeCounts.value)
  const counts = types.map(t => typeCounts.value[t])
  const amounts = types.map(t => typeAmounts.value[t] || 0)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['笔数', '总金额(元)'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: types,
      axisLabel: { rotate: 0 }
    },
    yAxis: [
      {
        type: 'value',
        name: '笔数',
        min: 0
      },
      {
        type: 'value',
        name: '金额(元)',
        min: 0
      }
    ],
    series: [
      {
        name: '笔数',
        type: 'bar',
        data: counts,
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '总金额(元)',
        type: 'bar',
        yAxisIndex: 1,
        data: amounts,
        itemStyle: { color: '#67C23A' }
      }
    ]
  }

  chartInstance.setOption(option)
  window.addEventListener('resize', () => chartInstance?.resize())
}

// 数据变化时更新图表
watch([typeCounts, typeAmounts], () => {
  nextTick(() => {
    initChart()
  })
}, { deep: true })

// 生命周期
onMounted(() => {
  store.fetchTransactions()
  // 等待DOM渲染完成
  nextTick(() => {
    initChart()
  })
})

onActivated(() => {
  store.fetchTransactions()
  // 切回来时重新渲染图表
  nextTick(() => {
    initChart()
  })
})
</script>

<style scoped>
.summary-container {
  padding: 20px;
}

.cards-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 4px 0;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 16px;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-top: 4px;
}
</style>