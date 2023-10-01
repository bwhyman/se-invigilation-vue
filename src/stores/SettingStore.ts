import type { Setting } from '@/types'
import { defineStore } from 'pinia'

export const useSettingStore = defineStore('useSettingStore', () => {
  const settingsR = ref<Setting[]>([])

  return { settingsR }
})
