import type {
  Department,
  DingNoticeResponse,
  Invigilation,
  ResultVO,
  Timetable,
  User
} from '@/types'
import axios from '@/axios'
import { useDepartmentsStore } from '@/stores/DepartmentStore'
import { useUsersStore } from '@/stores/UsersStore'
import { useMessageStore } from '@/stores/MessageStore'
import { stringTimetables } from './Utils'
import { useInvigilationsStore } from '@/stores/InvigilationsStore'

const COLLEGE = 'college'

const departmentsStore = useDepartmentsStore()
const usersStore = useUsersStore()
const messageStore = useMessageStore()
//
export const listOpenedDepartmentsService = async () => {
  const departments = storeToRefs(departmentsStore).departments
  if (departments.value.length > 0) {
    return departments.value
  }
  const resp = await axios.get<ResultVO<{ departments: Department[] }>>(
    `${COLLEGE}/departments/opened`
  )
  const deps = resp.data.data && resp.data.data.departments
  //
  departments.value = deps ?? []
  return deps ?? []
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
  const resp = await axios.get<ResultVO<{ invis: Invigilation[] }>>(
    `${COLLEGE}/invilations/imported`
  )
  const invis = resp.data.data!.invis
  return invis ?? []
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

  return true
}

export const getCollegeUsersService = async () => {
  const resp = await axios.get<ResultVO<{ users: User[] }>>(`${COLLEGE}/users`)
  const users = resp.data.data?.users
  if (!users) return
  //

  storeToRefs(usersStore).usersS.value = users
  return users ?? []
}

export const addTimetablesService = async (timetables: Timetable[]) => {
  stringTimetables(timetables)
  const resp = await axios.post(`${COLLEGE}/timetables`, timetables)
  storeToRefs(messageStore).messageS.value = '导入完成'
  return true
}

export const listDispatchersService = async (depid: string) => {
  const resp = await axios.get<ResultVO<{ users: User[] }>>(`${COLLEGE}/dispatchers/${depid}`)

  return resp.data.data?.users ?? []
}

export const noticeDispatcherService = async (users: string[]) => {
  const userIds = users.join(',')
  const resp = await axios.post<ResultVO<{ dingResp: DingNoticeResponse }>>(
    `${COLLEGE}/dispatchnotices`,
    { userIds: userIds }
  )
  const dingResp = resp.data.data?.dingResp
  //const dingResp: DingNoticeResponse = { task_id: '12' }
  return dingResp
}

export const addInviSerivce = async (invi: Invigilation) => {
  // @ts-ignore
  invi.importer = JSON.stringify(invi.importer)
  // @ts-ignore
  invi.course = JSON.stringify(invi.course)
  // @ts-ignore
  invi.time = JSON.stringify(invi.time)

  const resp = await axios.post(`${COLLEGE}/invigilation`, invi)
  return true
}

//
export const addTimetableService = async (userid: string, timetables: Timetable[]) => {
  stringTimetables(timetables)
  const resp = await axios.post(`${COLLEGE}/timetables/${userid}`, timetables)

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
  const resp = await axios.patch<ResultVO<{ invi: Invigilation }>>(
    `${COLLEGE}/invigilations/edit`,
    invi
  )
  const temp = resp.data.data?.invi
  storeToRefs(useInvigilationsStore()).currentInviS.value = temp
  return temp
}

// 删除监考
export const delInviService = async (inviid: string) => {
  const resp = axios.delete(`${COLLEGE}/invigilations/${inviid}`)
  return true
}

// 重置监考为未下发状态，发送取消通知，重置信息等
export const resetInviService = async (inviid: string) => {
  const resp = axios.put(`${COLLEGE}/invigilations/${inviid}/status`)

  return true
}

//
export const listDepartmentsService = async () => {
  const resp = await axios.get<ResultVO<{ departments: Department[] }>>(`${COLLEGE}/departments`)
  const departs = resp.data.data?.departments ?? []
  return departs
}

//
export const updateDepartmentInviStatus = async (departs: Department[]) => {
  const resp = await axios.patch<ResultVO<{ departments: Department[] }>>(
    `${COLLEGE}/departments/invistatus`,
    departs
  )
  const departments = resp.data.data?.departments ?? []
  storeToRefs(useDepartmentsStore()).departments.value = []
  return departments
}
