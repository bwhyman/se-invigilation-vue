import type { Setting } from '@/types'

const settingsR = ref<Setting[]>([])

const getFirstWeek = () => {
  return settingsR.value.find((set) => set.key == 'firstweek')?.value ?? ''
}
const getWebUrl = () => {
  return settingsR.value.find((set) => set.key == 'weburl')?.value ?? ''
}

export const useSettingStore = () => {
  return { settingsR, getFirstWeek, getWebUrl }
}
