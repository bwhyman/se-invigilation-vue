import type {
  AssignUser,
  Department,
  DingNoticeResponse,
  DingUser,
  InviCount,
  Invigilation,
  Notice,
  NoticeRemark,
  ResultVO,
  Timetable,
  User,
  UserDepartment
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
  let invisImported = storeToRefs(invisStore).invigilationsImportS
  if (invisImported.value.length > 0) return invisImported

  const resp = await axios.get<ResultVO<{ invis: Invigilation[] }>>(
    `${COLLEGE}/invilations/imported`
  )
  invisImported.value = resp.data.data!.invis ?? []

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
  const invisDepatchedS = invisStore.invigilationsDispatchMapS.get(`${depid}-${page}`)
  if (invisDepatchedS) return invisDepatchedS
  const resp = await axios.get<ResultVO<{ invis: Invigilation[] }>>(
    `${COLLEGE}/invilations/dispatched/${depid}/${page}`
  )
  const invis = resp.data.data!.invis
  invisStore.invigilationsDispatchMapS.set(`${depid}-${page}`, invis)
  return invis ?? []
}

//
export const updateInvisService = async (invis: Invigilation[]) => {
  // 清空已导入监考缓存
  invisStore.clear()
  invis.forEach((i) => {
    // @ts-ignore
    i.dispatcher && (i.dispatcher = JSON.stringify(i.dispatcher))
    // @ts-ignore
    i.department && (i.department = JSON.stringify(i.department))
  })
  const resp = await axios.patch<ResultVO<{ invis: Invigilation[] }>>(
    `${COLLEGE}/invigilations/dispatch`,
    invis
  )
  invisStore.invigilationsImportS = resp.data.data?.invis ?? []
  return invisStore.invigilationsImportS
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

export const noticeDispatcherService = async (notice: Notice) => {
  const resp = await axios.post<ResultVO<{ dingResp: DingNoticeResponse }>>(
    `${COLLEGE}/dispatchnotices`,
    notice
  )
  const dingResp = resp.data.data?.dingResp

  return dingResp
}

//
export const addInviSerivce = async (invi: Invigilation) => {
  // 清空已导入监考缓存
  invisStore.clear()
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

  invisStore.clear()
  const resp = await axios.patch<ResultVO<{ invi: Invigilation }>>(
    `${COLLEGE}/invigilations/edit`,
    invi
  )
  const temp = resp.data.data?.invi

  return temp
}

// 删除监考
export const delInviService = async (inviid: string) => {
  invisStore.clear()
  await axios.delete(`${COLLEGE}/invigilations/${inviid}`)
  return true
}

// 重置监考为未下发状态，重置信息等
export const resetInviService = async (inviid: string) => {
  invisStore.clear()
  await axios.put(`${COLLEGE}/invigilations/${inviid}/status`)
  return true
}

//
export const listDepartmentsService = async () => {
  const departments = storeToRefs(departmentsStore).departments
  if (departments.value.length > 0) {
    return departments
  }
  const resp = await axios.get<ResultVO<{ departments: Department[] }>>(`${COLLEGE}/departments`)
  departments.value = resp.data.data?.departments ?? []
  return departments
}

//
export const updateDepartmentInviStatusService = async (departs: Department[]) => {
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
  // @ts-ignore
  user.executor = JSON.stringify(user.executor)
  // @ts-ignore
  user.department = JSON.stringify(user.department)
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

//
export const updateUserDepartmentService = async (user: User) => {
  // @ts-ignore
  user.department = JSON.stringify(user.department)
  await axios.post(`${COLLEGE}/departments/updateuser`, user)

  return true
}

// 重置指定账号密码
export const resetPasswordService = async (account: string) => {
  await axios.put(`${COLLEGE}/passwords/${account}`)

  return true
}

export const addUserService = async (user: User) => {
  // @ts-ignore
  user.department = JSON.stringify(user.department)
  await axios.post(`${COLLEGE}/users`, user)

  return true
}

//
export const listInvisByDateService = async (sdate: string, edate: string) => {
  const key = `${sdate}-${edate}`
  const dateInvis = useInvigilationsStore().dateInivsMap.get(key)
  if (dateInvis) return dateInvis

  const resp = await axios.get<ResultVO<{ invis: Invigilation[] }>>(
    `${COLLEGE}/invis/date/${sdate}/${edate}`
  )
  const invis = resp.data.data?.invis ?? []
  useInvigilationsStore().dateInivsMap.clear()
  useInvigilationsStore().dateInivsMap.set(key, invis)

  return invis
}

//
export const sendInviRemarkNoticeService = async (notice: NoticeRemark) => {
  const resp = await axios.post<ResultVO<{ result: { request_id: string } }>>(
    `${COLLEGE}/invinotices`,
    notice
  )
  return resp.data.data?.result.request_id ?? ''
}

// 获取指定学院，指定id的监考信息
export const getCollegeInviService = async (inviid: string) => {
  let invi = invisStore.currentInviS
  if (invi) return invi

  const resp = await axios.get<ResultVO<{ invi: Invigilation }>>(`${COLLEGE}/invis/${inviid}`)
  invi = resp.data.data?.invi

  return invi
}

//
export const listUserDingIdsService = async (userIds: string[]) => {
  const resp = await axios.post<ResultVO<{ users: User[] }>>(`invinotices/dingids`, userIds)

  return resp.data.data?.users ?? []
}

//
export const cutInviService = async (oldInviid: string, invi: Invigilation) => {
  // 清空已导入监考缓存
  invisStore.clear()
  // @ts-ignore
  invi.importer = JSON.stringify(invi.importer)
  // @ts-ignore
  invi.course = JSON.stringify(invi.course)
  // @ts-ignore
  invi.time = JSON.stringify(invi.time)

  const resp = await axios.post<ResultVO<{ invis: Invigilation[] }>>(
    `${COLLEGE}/cutinvigilation/${oldInviid}`,
    invi
  )

  storeToRefs(invisStore).invigilationsImportS.value = resp.data.data?.invis ?? []
}

// 基于用户姓名获取用户信息
export const getUserByNameServie = async (name: string) => {
  const resp = await axios.get<ResultVO<{ users: User[] }>>(`${COLLEGE}/users/${name}`)
  return resp.data.data?.users ?? []
}

//
export const listDepartmentUsersService = async (depid: string) => {
  const resp = await axios.get<ResultVO<{ users: User[] }>>(`${COLLEGE}/department/${depid}/users`)
  return resp.data.data?.users ?? []
}

// 基于钉钉注册手机号，获取用户信息
export const getDingUserService = async (mobile: string) => {
  const resp = await axios.get<ResultVO<{ dinguser: DingUser }>>(`${COLLEGE}/mobiles/${mobile}`)
  return resp.data.data?.dinguser
}

//
export const removeUserService = async (uid: string) => {
  await axios.delete(`${COLLEGE}/users/${uid}`)
  return true
}

//
export const removeCollegeInvisService = async () => {
  await axios.delete(`${COLLEGE}/colleges/datareset`)
  return true
}

//
export const removeDepartmentService = async (depid: string) => {
  const resp = await axios.delete<ResultVO<{ departments: Department[] }>>(
    `${COLLEGE}/departments/${depid}`
  )
  storeToRefs(departmentsStore).departments.value = resp.data.data?.departments ?? []
  storeToRefs(departmentsStore).departmentsOpened.value = []
}
// 更新部门名称
export const updateDepartmentNameService = async (depart: UserDepartment) => {
  const resp = await axios.patch<ResultVO<{ departments: Department[] }>>(
    `${COLLEGE}/departments/${depart.depId}`,
    depart
  )
  storeToRefs(departmentsStore).departments.value = resp.data.data?.departments ?? []
  storeToRefs(departmentsStore).departmentsOpened.value = []
  return true
}
