import type { Setting } from '@/types'
import { defineStore } from 'pinia'

export const useSettingStore = defineStore('useSettingStore', () => {
  const settingsR = ref<Setting[]>([])

  const getFirstWeek = () => {
    return settingsR.value.find((set) => set.key == 'firstweek')?.value ?? ''
  }
  const getWebUrl = () => {
    return settingsR.value.find((set) => set.key == 'weburl')?.value ?? ''
  }

  return { settingsR, getFirstWeek, getWebUrl }
})
