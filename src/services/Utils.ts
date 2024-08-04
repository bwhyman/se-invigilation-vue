import { useSettingStore } from '@/stores/SettingStore'
import type { Invigilation, Timetable, User } from '@/types'
const settingStore = useSettingStore()

//
export const getInviWeek = (date: string) => {
  const startDate = new Date(settingStore.getFirstWeek()).getTime()
  const inviDate = new Date(date).getTime()

  return Math.floor((inviDate - startDate) / (1000 * 60 * 60 * 24 * 7)) + 1
}

export const getInviDayweek = (date: string) => {
  const dayweek = new Date(date).getDay()
  return dayweek == 0 ? 7 : dayweek
}

export const getInviChineseDayweek = (date: string) => {
  return new Date(date).toLocaleString('zh-cn', { weekday: 'long' })
}

//
export const stringInviTime = (user: User) => {
  const time = new Date()
  time.setHours(time.getHours() + 8)
  return {
    userId: user.id!,
    userName: user.name!,
    time: time.toISOString().substring(0, 19)
  }
}

//
export const stringTimetables = (tbs: Timetable[]) => {
  tbs.forEach((tb) => {
    // @ts-ignore
    tb.course = JSON.stringify(tb.course)
  })
  return tbs
}

const period_12 = { period: '12', stime: '08:00', etime: '09:50' }
const period_34 = { period: '34', stime: '10:00', etime: '12:00' }
const period_56 = { period: '56', stime: '13:20', etime: '15:15' }
const period_78 = { period: '78', stime: '15:30', etime: '17:10' }
const period_910 = { period: '910', stime: '18:00', etime: '19:35' }
const period_1112 = { period: '1112', stime: '19:35', etime: '21:20' }

const periods = [period_12, period_34, period_56, period_78, period_910, period_1112]

export const confTime = (date: string, time: string, period: string) => {
  const invitime = new Date(`${date} ${time}`)
  const x = periods.find(
    (p) => invitime >= new Date(`${date} ${p.stime}`) && invitime <= new Date(`${date} ${p.etime}`)
  )?.period

  return period == x
}

//
export const replaceTDateC = computed(() => (date: string) => date.replace('T', ' '))

//
export const bellTitleC = computed(() => (invi: Invigilation) => `ID: ${invi.calendarId}`)
export const beNoticedC = computed(() => (exid: string, noticeIds: string[] = []) => {
  return noticeIds.indexOf(exid) != -1
})

//
export const getInviWeekC = () => {
  return computed(() => (date: string) => getInviWeek(date))
}
export const getInviChinesedayweekC = computed(() => (date: string) => getInviChineseDayweek(date))
