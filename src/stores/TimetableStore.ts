import type { Timetable } from '@/types'

const timetableMapS = shallowRef<Map<string, Timetable[]>>(new Map())
const clear = () => timetableMapS.value.clear()
const store = { timetableMapS, clear }
export const useTimetablesStore = () => store
