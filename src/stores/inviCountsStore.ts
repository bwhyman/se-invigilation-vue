import type { InviCount } from '@/types'

const inviCounts = ref<InviCount[]>([])
const clear = () => (inviCounts.value = [])
const store = { inviCounts, clear }
export const useInviCountsStore = () => {
  return store
}
