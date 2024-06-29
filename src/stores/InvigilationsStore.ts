import type { Invigilation } from '@/types'

const invigilationsImportS = ref<Invigilation[]>([])
const invigilationsDispatchMapS = ref<Map<string, Invigilation[]>>(
  new Map<string, Invigilation[]>()
)
const currentInviS = ref<Invigilation>()

const invisAllS = ref<Invigilation[]>([])
const dateInivsMap = ref<Map<string, Invigilation[]>>(new Map<string, Invigilation[]>())
const clearInvis = () => {
  invigilationsImportS.value = []
  invigilationsDispatchMapS.value.clear()
}
export const useInvigilationsStore = () => {
  return {
    invigilationsImportS,
    invigilationsDispatchMapS,
    currentInviS,
    invisAllS,
    dateInivsMap,
    clearInvis
  }
}
