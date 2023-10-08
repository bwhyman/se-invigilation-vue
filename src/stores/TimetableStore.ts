import type { Timetable } from '@/types'
import { defineStore } from 'pinia'

export const useTimetablesStore = defineStore('useTimetablesStore', () => {
  const timetableMap = new Map<string, Timetable[]>()

  return { timetableMap }
})
