import type { Invigilation } from '@/types'

export const useInvigilationsStore = defineStore('useInvigilationsStore', () => {
  const invigilationsImportS = ref<Invigilation[]>([])
  const invigilationsDispatchMapS = ref<Map<string, Invigilation[]>>(new Map<string, Invigilation[]>())
  const currentInviS = ref<Invigilation>()

  const invisAllS = ref<Invigilation[]>([])
  const dateInivsMap = ref<Map<string, Invigilation[]>>(new Map<string, Invigilation[]>())
  const clear = () => {
    invigilationsImportS.value = []
    invigilationsDispatchMapS.value.clear()
    currentInviS.value = undefined
  }
  return {
    invigilationsImportS,
    invigilationsDispatchMapS,
    currentInviS,
    invisAllS,
    dateInivsMap,
    clear
  }
})
