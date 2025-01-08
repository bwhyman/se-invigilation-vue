import type { Invigilation } from '@/types'
import { useTotalsStore } from './TotalsStore'
const depTotalsStore = useTotalsStore()

const invigilationsImportS = shallowRef<Invigilation[]>()
const invigilationsDispatchedS = shallowRef<Invigilation[]>()
//
const invigilationsDispatchMapS = shallowRef<Map<string, Invigilation[]>>(new Map())
// 专业指定日期的全部监考
const dateInvisMapS = shallowRef<Map<string, Invigilation[]>>(new Map())

const currentInviS = shallowRef<Invigilation>()

const invisAllS = shallowRef<Invigilation[]>()

const clear = () => {
  invigilationsImportS.value = undefined
  invigilationsDispatchedS.value = undefined
  invigilationsDispatchMapS.value.clear()
  dateInvisMapS.value.clear()
  depTotalsStore.clear()
}
const clearCurrentInvi = () => (currentInviS.value = undefined)
const store = {
  invigilationsImportS,
  invigilationsDispatchedS,
  invigilationsDispatchMapS,
  currentInviS,
  invisAllS,
  dateInvisMapS,
  clear,
  clearCurrentInvi
}
export const useInvigilationsStore = () => store
