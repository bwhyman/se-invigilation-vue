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
import { useInvigilationsStore } from '@/stores/InvigilationsStore'
import { ASSIGN, DISPATCH, IMPORT } from './Const'
import { stringTimetables } from './Utils'
import router from '@/router'

const departmentsStore = useDepartmentsStore()
const invisStore = useInvigilationsStore()
const usersStore = useUsersStore()
const messageStore = useMessageStore()
//
export const listDepartmentsService = async () => {
  const resp = await axios.get<ResultVO<{ departments: Department[] }>>(`college/departments`)
  const deps = resp.data.data && resp.data.data.departments
  //
  storeToRefs(departmentsStore).departments.value = deps ?? []
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
  const resp = await axios.post('college/invigilations', invis)
  return true
}

//
export const listCollegeInvigilationsService = async (status: number) => {
  const resp = await axios.get<ResultVO<{ invis: Invigilation[] }>>(
    `college/invigilations/status/${status}`
  )
  const invis = resp.data.data!.invis

  switch (status) {
    case IMPORT:
      storeToRefs(invisStore).invigilationsImportS.value = invis
      break
    case DISPATCH:
      storeToRefs(invisStore).invigilationsDispatchS.value = invis
      break
    case ASSIGN:
      storeToRefs(invisStore).invigilationsAssignS.value = invis
      break
  }
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
    'college/invigilations',
    invis
  )
  storeToRefs(invisStore).invigilationsImportS.value = resp.data.data?.invis ?? []
  return true
}

export const getCollegeUsersService = async () => {
  const resp = await axios.get<ResultVO<{ users: User[] }>>('college/users')
  const users = resp.data.data?.users
  if (!users) return
  //

  storeToRefs(usersStore).usersS.value = users
  return users ?? []
}

export const addTimetablesService = async (timetables: Timetable[]) => {
  stringTimetables(timetables)
  const resp = await axios.post('college/timetables', timetables)
  storeToRefs(messageStore).messageS.value = '导入完成'
  return true
}

export const listDispatchersService = async (depid: string) => {
  const resp = await axios.get<ResultVO<{ users: User[] }>>(`college/dispatchers/${depid}`)

  return resp.data.data?.users ?? []
}

export const noticeDispatcherService = async (users: string[]) => {
  // const userIds = users.join(',')
  // const resp = await axios.post<ResultVO<{ dingResp: DingNoticeResponse }>>(
  //   'college/dispatchnotices',
  //   userIds
  // )
  // const dingResp = resp.data.data?.dingResp

  const dingResp: DingNoticeResponse = { task_id: '12' }
  return dingResp
}

export const addInviSerivce = async (invi: Invigilation) => {
  // @ts-ignore
  invi.importer = JSON.stringify(invi.importer)
  // @ts-ignore
  invi.course = JSON.stringify(invi.course)
  // @ts-ignore
  invi.time = JSON.stringify(invi.time)

  const resp = await axios.post('college/invigilation', invi)
  return true
}
