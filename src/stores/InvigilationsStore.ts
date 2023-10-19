import type { Invigilation } from '@/types'

export const useInvigilationsStore = defineStore('useInvigilationsStore', () => {
  const invigilationsImportS = ref<Invigilation[]>([])
  const invigilationsDispatchS = ref<Invigilation[]>([])
  const currentInviS = ref<Invigilation>()

  const invisAllS = ref<Invigilation[]>([])
  const dateInivsMap = ref<Map<string, Invigilation[]>>(new Map<string, Invigilation[]>())
  return {
    invigilationsImportS,
    invigilationsDispatchS,
    currentInviS,
    invisAllS,
    dateInivsMap
  }
})
