import type { Setting } from '@/types'

const settingsR = shallowRef<Setting[]>()

const getFirstWeek = () => {
  return settingsR.value?.find((set) => set.skey == 'firstweek')?.svalue ?? ''
}

const clear = () => (settingsR.value = undefined)

const store = { settingsR, getFirstWeek, clear }
export const useSettingStore = () => store
