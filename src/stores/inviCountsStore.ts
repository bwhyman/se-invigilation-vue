import type { InviCount } from '@/types'
import { defineStore } from 'pinia'

export const useInviCountsStore = defineStore('useInviCountsStore', () => {
  const inviCounts = ref<InviCount[]>([])
  return { inviCounts }
})
