import type {
  AssignUser,
  Department,
  DingNoticeResponse,
  InviCount,
  Invigilation,
  ResultVO,
  Timetable,
  User
} from '@/types'
import axios from '@/axios'
import { useDepartmentsStore } from '@/stores/DepartmentStore'
import { useUsersStore } from '@/stores/UsersStore'
import { stringTimetables } from './Utils'
import { useInvigilationsStore } from '@/stores/InvigilationsStore'

const COLLEGE = 'college'

//
const departmentsStore = useDepartmentsStore()
const usersStore = useUsersStore()
const invisStore = useInvigilationsStore()

//
export const listOpenedDepartmentsService = async () => {
  let departments = departmentsStore.departmentsOpened
  if (departments.length > 0) return departments

  const resp = await axios.get<ResultVO<{ departments: Department[] }>>(
    `${COLLEGE}/departments/opened`
  )
  //
  departmentsStore.departmentsOpened = departments = resp.data.data!.departments ?? []
  return departments
}

//
export const addInvigilationsService = async (invis: Invigilation[]) => {
  invis.forEach((i) => {
    // @ts-ignore
    i.time = JSON.stringify(i.time)
    // @ts-ignore
    i.course = JSON.stringify(i.course)
    // @ts-ignore
    i.importer = JSON.stringify(i.importer)
  })
  await axios.post(`${COLLEGE}/invigilations`, invis)
  return true
}

export const listImportedService = async () => {
  let invisImported = invisStore.invigilationsImportS
  if (invisImported.length > 0) return invisImported

  const resp = await axios.get<ResultVO<{ invis: Invigilation[] }>>(
    `${COLLEGE}/invilations/imported`
  )
  invisStore.invigilationsImportS = invisImported = resp.data.data!.invis ?? []

  return invisImported
}

export const getImportedTotalService = async () => {
  const resp = await axios.get<ResultVO<{ total: number }>>(
    `${COLLEGE}/invigilations/imported/total`
  )
  return resp.data.data?.total ?? 0
}

export const getDepatchedTotalService = async (depid: string) => {
  const resp = await axios.get<ResultVO<{ total: number }>>(
    `${COLLEGE}/invigilations/dispatched/${depid}/total`
  )
  return resp.data.data?.total ?? 0
}

export const listDepatchedsService = async (depid: string, page: number) => {
  const resp = await axios.get<ResultVO<{ invis: Invigilation[] }>>(
    `${COLLEGE}/invilations/dispatched/${depid}/${page}`
  )
  const invis = resp.data.data!.invis
  return invis ?? []
}

//
export const updateInvisService = async (invis: Invigilation[]) => {
  // 清空已导入监考缓存
  invisStore.invigilationsImportS.length = 0

  invis.forEach((i) => {
    // @ts-ignore
    i.dispatcher && (i.dispatcher = JSON.stringify(i.dispatcher))
    // @ts-ignore
    i.department && (i.department = JSON.stringify(i.department))
  })
  await axios.patch<ResultVO<{ invis: Invigilation[] }>>(`${COLLEGE}/invigilations/dispatch`, invis)

  return true
}

export const listCollegeUsersService = async () => {
  let users = usersStore.usersS
  if (users.length > 0) return users

  const resp = await axios.get<ResultVO<{ users: User[] }>>(`${COLLEGE}/users`)
  usersStore.usersS = users = resp.data.data?.users ?? []
  return users
}

//
export const addTimetablesService = async (timetables: Timetable[]) => {
  stringTimetables(timetables)
  await axios.post(`${COLLEGE}/timetables`, timetables)

  return true
}

//
export const listDispatchersService = async (depid: string) => {
  const resp = await axios.get<ResultVO<{ users: User[] }>>(`${COLLEGE}/dispatchers/${depid}`)

  return resp.data.data?.users ?? []
}

export const noticeDispatcherService = async (users: string[], message: string) => {
  const userIds = users.join(',')
  const resp = await axios.post<ResultVO<{ dingResp: DingNoticeResponse }>>(
    `${COLLEGE}/dispatchnotices`,
    { userIds, message }
  )
  const dingResp = resp.data.data?.dingResp

  return dingResp
}

//
export const addInviSerivce = async (invi: Invigilation) => {
  // 清空已导入监考缓存
  invisStore.invigilationsImportS.length = 0
  // @ts-ignore
  invi.importer = JSON.stringify(invi.importer)
  // @ts-ignore
  invi.course = JSON.stringify(invi.course)
  // @ts-ignore
  invi.time = JSON.stringify(invi.time)

  await axios.post(`${COLLEGE}/invigilation`, invi)
  return true
}

//
export const addTimetableService = async (userid: string, timetables: Timetable[]) => {
  stringTimetables(timetables)
  await axios.post(`${COLLEGE}/timetables/${userid}`, timetables)

  return true
}

//
export const updateInviService = async (invi: Invigilation) => {
  // @ts-ignore
  invi.time = JSON.stringify(invi.time)
  // @ts-ignore
  invi.course = JSON.stringify(invi.course)
  // @ts-ignore
  invi.dispatcher = JSON.stringify(invi.dispatcher)

  storeToRefs(invisStore).invigilationsImportS.value = []
  storeToRefs(invisStore).invigilationsDispatchS.value = []
  const resp = await axios.patch<ResultVO<{ invi: Invigilation }>>(
    `${COLLEGE}/invigilations/edit`,
    invi
  )
  const temp = resp.data.data?.invi

  return temp
}

// 删除监考
export const delInviService = async (inviid: string) => {
  axios.delete(`${COLLEGE}/invigilations/${inviid}`)
  return true
}

// 重置监考为未下发状态，发送取消通知，重置信息等
export const resetInviService = async (inviid: string) => {
  await axios.put(`${COLLEGE}/invigilations/${inviid}/status`)

  return true
}

//
export const listDepartmentsService = async () => {
  const departments = departmentsStore.departments
  if (departments.length > 0) {
    return departments
  }
  const resp = await axios.get<ResultVO<{ departments: Department[] }>>(`${COLLEGE}/departments`)
  const departs = resp.data.data?.departments ?? []
  departmentsStore.departments = departs
  return departs
}

//
export const updateDepartmentInviStatus = async (departs: Department[]) => {
  const resp = await axios.patch<ResultVO<{ departments: Department[] }>>(
    `${COLLEGE}/departments/invistatus`,
    departs
  )
  const departments = resp.data.data?.departments ?? []
  departmentsStore.departmentsOpened = []
  departmentsStore.departments = []
  return departments
}

//
export const listUsersByNameService = async (depid: string, name: string) => {
  const resp = await axios.get<ResultVO<{ users: User[] }>>(
    `${COLLEGE}/departments/${depid}/names/${name}`
  )
  const users = resp.data.data?.users ?? []

  return users
}

//
export const addAssignService = async (inviid: string, user: AssignUser) => {
  // @ts-ignore
  user.allocator = JSON.stringify(user.allocator)
  await axios.post(`${COLLEGE}/assigns/invis/${inviid}`, user)
}

//
export const getUserService = async (account: string) => {
  const resp = await axios.get<ResultVO<{ user: User }>>(`users/${account}`)

  return resp.data.data?.user
}

// 更新指定账号教师的角色
export const updateUserRoleService = async (user: User) => {
  await axios.post(`${COLLEGE}/roles`, user)
  return true
}

//
export const listCollegeInviDetailsService = async () => {
  let invisAll = invisStore.invisAllS
  if (invisAll.length > 0) return invisAll

  const resp = await axios.get<ResultVO<{ invis: Invigilation[] }>>(`${COLLEGE}/invis/all`)
  invisStore.invisAllS = invisAll = resp.data.data?.invis ?? []
  return invisAll
}

//
export const listCollegeCountsService = async () => {
  const resp = await axios.get<ResultVO<{ counts: InviCount[] }>>(`${COLLEGE}/invis/counts`)

  return resp.data.data?.counts ?? []
}
