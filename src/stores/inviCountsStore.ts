import type { InviCount } from '@/types'

const inviCounts = ref<InviCount[]>([])
export const useInviCountsStore = () => {
  return { inviCounts }
}
