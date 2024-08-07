import type { Invigilation } from '@/types'
import { useTotalsStore } from './TotalsStore'
const depTotalsStore = useTotalsStore()

const invigilationsImportS = ref<Invigilation[]>()
//
const invigilationsDispatchMapS = ref<Map<string, Invigilation[]>>(new Map())
// 专业指定日期的全部监考
const dateInvisMapS = ref<Map<string, Invigilation[]>>(new Map())

const currentInviS = ref<Invigilation>()

const invisAllS = ref<Invigilation[]>()

const clear = () => {
  invigilationsImportS.value = undefined
  invigilationsDispatchMapS.value.clear()
  dateInvisMapS.value.clear()
  depTotalsStore.clear()
}
const clearCurrentInvi = () => (currentInviS.value = undefined)
const store = {
  invigilationsImportS,
  invigilationsDispatchMapS,
  currentInviS,
  invisAllS,
  dateInvisMapS,
  clear,
  clearCurrentInvi
}
export const useInvigilationsStore = () => store
