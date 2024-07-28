import type { Setting } from '@/types'

const settingsR = ref<Setting[]>([])

const getFirstWeek = () => {
  return settingsR.value.find((set) => set.key == 'firstweek')?.value ?? ''
}

const store = { settingsR, getFirstWeek }
export const useSettingStore = () => store
