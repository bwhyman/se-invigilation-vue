import axios from '@/axios'
import { useUsersStore } from '@/stores/UsersStore'
import type {
  AssignUser,
  ExcludeRule,
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
import { useExcludeRulesStore } from '@/stores/ExcludeRuleStore'

const SUBJECT = 'subject'

const usersStore = useUsersStore()
const timetablesStore = useTimetablesStore()
const inviCountsStore = useInviCountsStore()
const invisStore = useInvigilationsStore()
const excludeRulesStore = useExcludeRulesStore()

// 加载专业内全部教师
export const listUsersService = async () => {
  const usersS = usersStore.usersS
  if (usersS.value.length > 0) return usersS

  const resp = await axios.get<ResultVO<{ users: User[] }>>(`${SUBJECT}/users`)
  //
  usersS.value = resp.data.data?.users ?? []
  return usersS
}

//
export const listInvisService = async (status: number, page: number) => {
  let invis = invisStore.invigilationsDispatchMapS.value.get(`${status}-${page}`)
  if (invis) return invis

  const resp = await axios.get<ResultVO<{ invis: Invigilation[] }>>(
    `${SUBJECT}/invis/status/${status}/${page}`
  )
  invis = resp.data.data!.invis ?? []
  invisStore.invigilationsDispatchMapS.value.set(`${status}-${page}`, invis)
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
  usersStore.usersS.value = []
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
  const resp = await axios.get<ResultVO<{ invis: Invigilation[] }>>(
    `${SUBJECT}/invis/dates/${date}`
  )
  return resp.data.data?.invis ?? []
}

//
export const listCountsService = async () => {
  const inviCountsS = inviCountsStore.inviCounts
  if (inviCountsS.value.length > 0) return inviCountsS

  const resp = await axios.get<ResultVO<{ counts: InviCount[] }>>(`${SUBJECT}/invidetails/counts`)
  inviCountsS.value = resp.data.data?.counts ?? []
  return inviCountsS
}

//
export const addAssignUsersService = async (inviid: string, user: AssignUser) => {
  // @ts-ignore
  user.allocator = JSON.stringify(user.allocator)
  // @ts-ignore
  user.executor = JSON.stringify(user.executor)
  await axios.post(`${SUBJECT}/invidetails/${inviid}`, user)
  // 清空教师监考数量缓存
  inviCountsStore.inviCounts.value.length = 0
  // 清空当前监考缓存
  invisStore.clearInvis()
  return true
}

export const listInviDetailUsersService = async (inviid: string) => {
  const resp = await axios.get<ResultVO<{ users: User[] }>>(`${SUBJECT}/invidetailusers/${inviid}`)
  const users = resp.data.data?.users
  return users ?? []
}

export const noticeUsersService = async (notice: Notice) => {
  const resp = await axios.post<ResultVO<{ code: string }>>(`${SUBJECT}/assignnotices`, notice)
  return resp.data.data?.code
}

//
export const getInviService = async (inviid: string) => {
  const invi = invisStore.currentInviS
  if (invi.value) return invi
  const resp = await axios.get<ResultVO<{ invi: Invigilation }>>(`${SUBJECT}/invis/${inviid}`)
  invi.value = resp.data.data?.invi

  return invi
}

//
export const getDepartmentCommentService = async () => {
  const resp = await axios.get<ResultVO<{ comment: string }>>(`${SUBJECT}/comments`)
  return resp.data.data?.comment ?? ''
}

//
export const addDepartmentCommentService = async (comment: string) => {
  await axios.post(`${SUBJECT}/comments`, { comment: comment })
  return true
}

//
export const listExcludeRulesService = async () => {
  const excludeRulesS = excludeRulesStore.excludeRules
  if (excludeRulesS.value.length > 0) return excludeRulesStore.excludeRules
  const resp = await axios.get<ResultVO<{ rules: ExcludeRule[] }>>(`${SUBJECT}/excluderules`)

  excludeRulesS.value = resp.data.data?.rules ?? []
  return excludeRulesS
}

//
export const addExcludeRuleService = async (rule: ExcludeRule) => {
  // @ts-ignore
  rule.dayweeks = JSON.stringify(rule.dayweeks)
  // @ts-ignore
  rule.periods = JSON.stringify(rule.periods)

  const resp = await axios.post<ResultVO<{ rules: ExcludeRule[] }>>(`${SUBJECT}/excluderules`, rule)
  excludeRulesStore.excludeRules.value = resp.data.data?.rules ?? []
  return excludeRulesStore.excludeRules
}
//
export const delExcludeRuleService = async (exid: string) => {
  const resp = await axios.delete<ResultVO<{ rules: ExcludeRule[] }>>(
    `${SUBJECT}/excluderules/${exid}`
  )
  excludeRulesStore.excludeRules.value = resp.data.data?.rules ?? []
  return excludeRulesStore.excludeRules
}
