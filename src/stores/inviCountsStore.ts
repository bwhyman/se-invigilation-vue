import type { InviCount } from '@/types'

const inviCounts = ref<InviCount[]>()
const clear = () => (inviCounts.value = undefined)
const store = { inviCounts, clear }
export const useInviCountsStore = () => {
  return store
}
