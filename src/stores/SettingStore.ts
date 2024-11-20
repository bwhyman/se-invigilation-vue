import type { Setting } from '@/types'

const settingsR = shallowRef<Setting[]>()

const getFirstWeek = () => {
  return settingsR.value?.find((set) => set.skey == 'firstweek')?.svalue ?? ''
}

const store = { settingsR, getFirstWeek }
export const useSettingStore = () => store
