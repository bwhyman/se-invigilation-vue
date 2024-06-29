import type { Timetable } from '@/types'

const timetableMap = new Map<string, Timetable[]>()
export const useTimetablesStore = () => {
  return { timetableMap }
}
