import type { Timetable } from '@/types'

const timetableMap = new Map<string, Timetable[]>()
const store = { timetableMap }
export const useTimetablesStore = () => {
  return store
}
