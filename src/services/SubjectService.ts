import axios from '@/axios'
import { useUsersStore } from '@/stores/UsersStore'
import type {
  AssignUser,
  InviCount,
  Invigilation,
  Notice,
  ResultVO,
  Timetable,
  User
} from '@/types'
import { useTimetablesStore } from '@/stores/TimetableStore'
import { useInvigilationsStore } from '@/stores/InvigilationsStore'
import { useInviCountsStore } from '@/stores/inviCountsStore'

const SUBJECT = 'subject'

const usersStore = useUsersStore()
const timetablesStore = useTimetablesStore()
const inviCountsStore = useInviCountsStore()

// 加载专业内全部教师
export const listUsersService = async () => {
  let users = usersStore.usersS
  if (users.length > 0) return users

  const resp = await axios.get<ResultVO<{ users: User[] }>>(`${SUBJECT}/users`)
  //
  usersStore.usersS = users = resp.data.data?.users ?? []
  return users
}

//
export const listInvisService = async (status: number, page: number) => {
  const resp = await axios.get<ResultVO<{ invis: Invigilation[] }>>(
    `${SUBJECT}/invis/status/${status}/${page}`
  )
  const invis = resp.data.data!.invis ?? []
  return invis
}

//
export const getTotalsService = async (status: number) => {
  const resp = await axios.get<ResultVO<{ total: number }>>(
    `${SUBJECT}/invis/status/${status}/total`
  )
  return resp.data.data?.total ?? 0
}

//
export const updateUserInviStatusService = async (users: User[]) => {
  // 改变教师状态监考状态，清空课表缓存。因为按开放教师加载的课表
  timetablesStore.timetableMap.clear()
  await axios.post<ResultVO<{ users: User[] }>>(`${SUBJECT}/invistatus`, users)
  // 清空教师，全部重新加载
  usersStore.usersS = []
  return true
}

// 加载开放状态教师课表
export const listTimetablesService = async (week: number, dayweek: number) => {
  const key = `${week}-${dayweek}`
  let timetables = timetablesStore.timetableMap.get(key)
  if (timetables) return timetables

  const resp = await axios.get<ResultVO<{ timetables: Timetable[] }>>(
    `${SUBJECT}/timetables/weeks/${week}/dayweeks/${dayweek}`
  )
  timetables = resp.data.data?.timetables ?? []
  timetablesStore.timetableMap.set(key, timetables)

  return timetables
}

//
export const listDateInvisService = async (date: string) => {
  const invisStore = useInvigilationsStore()
  let invis = invisStore.dateInvisMap.get(date)
  if (invis) return invis

  const resp = await axios.get<ResultVO<{ invis: Invigilation[] }>>(
    `${SUBJECT}/invis/dates/${date}`
  )
  invis = resp.data.data?.invis ?? []
  invisStore.dateInvisMap.set(date, invis)

  return invis
}

//
export const listCountsService = async () => {
  let inivC = inviCountsStore.inviCounts
  if (inivC.length > 0) return inivC

  const resp = await axios.get<ResultVO<{ counts: InviCount[] }>>(`${SUBJECT}/invidetails/counts`)
  inviCountsStore.inviCounts = inivC = resp.data.data?.counts ?? []
  return inivC
}

//
export const addAssignUsersService = async (inviid: string, user: AssignUser) => {
  // @ts-ignore
  user.allocator = JSON.stringify(user.allocator)
  await axios.post(`${SUBJECT}/invidetails/${inviid}`, user)
  // 清空教师监考数量缓存
  inviCountsStore.inviCounts.length = 0
  return true
}

export const listInviDetailUsersService = async (inviid: string) => {
  const resp = await axios.get<ResultVO<{ users: User[] }>>(`${SUBJECT}/invidetailusers/${inviid}`)
  const users = resp.data.data?.users
  return users ?? []
}

export const noticeUsersService = async (notice: Notice) => {
  // @ts-ignore
  //notice.noticeUserIds = JSON.stringify(notice.noticeUser)

  const resp = await axios.post<ResultVO<{ code: string }>>(`${SUBJECT}/assignnotices`, notice)
  return resp.data.data?.code
}
