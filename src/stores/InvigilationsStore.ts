import type { Invigilation } from '@/types'

export const useInvigilationsStore = defineStore('useInvigilationsStore', () => {
  const invigilationsImportS = ref<Invigilation[]>([])
  const invigilationsDispatchS = ref<Invigilation[]>([])
  const currentInviS = ref<Invigilation>()
  const dateInvisMap = new Map<string, Invigilation[]>()

  const invisAllS = ref<Invigilation[]>([])

  return {
    invigilationsImportS,
    invigilationsDispatchS,
    currentInviS,
    dateInvisMap,
    invisAllS
  }
})
