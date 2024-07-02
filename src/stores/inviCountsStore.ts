import type { InviCount } from '@/types'

const inviCounts = ref<InviCount[]>([])
const store = { inviCounts }
export const useInviCountsStore = () => {
  return store
}
