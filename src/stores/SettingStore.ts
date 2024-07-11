import type { Setting } from '@/types'

const settingsR = ref<Setting[]>([])

const getFirstWeek = () => {
  return settingsR.value.find((set) => set.key == 'firstweek')?.value ?? ''
}
const getWebUrl = () => {
  return settingsR.value.find((set) => set.key == 'weburl')?.value ?? ''
}

const store = { settingsR, getFirstWeek, getWebUrl }
export const useSettingStore = () => store
