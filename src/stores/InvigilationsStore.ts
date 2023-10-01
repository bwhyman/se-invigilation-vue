import type { Invigilation } from '@/types'

export const useInvigilationsStore = defineStore('useInvigilationsStore', () => {
  const invigilationsImportS = ref<Invigilation[]>([])
  const invigilationsDispatchS = ref<Invigilation[]>([])
  const invigilationsAssignS = ref<Invigilation[]>([])

  const currentInviS = ref<Invigilation>()

  return { invigilationsImportS, invigilationsDispatchS, invigilationsAssignS, currentInviS }
})
