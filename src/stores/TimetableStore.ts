import type { Timetable } from '@/types'
import { defineStore } from 'pinia'

export const useTimetablesStore = defineStore('useTimetablesStore', () => {
  const timetablesS = ref<Timetable[]>([])

  return { timetablesS }
})
