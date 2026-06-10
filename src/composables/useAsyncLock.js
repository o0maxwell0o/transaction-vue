import { ref } from 'vue'

export function useAsyncLock() {
  const loading = ref(false)

  const withLock = async (asyncFn) => {
    if (loading.value) return  // 正在执行中，直接返回
    loading.value = true
    try {
      return await asyncFn()
    } finally {
      loading.value = false
    }
  }

  return { loading, withLock }
}