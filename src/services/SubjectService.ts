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
import { useInvigilationsStore } from '@/stores/InvigilationsStore'
import { useInviCountsStore } from '@/stores/inviCountsStore'
import { useTimetablesStore } from '@/stores/TimetableStore'
import { ASSIGN, DISPATCH } from './Const'

const userStore = useUsersStore()
const usersStore = useUsersStore()
const invisStore = useInvigilationsStore()
const timetablesStore = useTimetablesStore()

// 加载专业内教师，专业ID从token解析注入而非传入
export const listUsersService = async () => {
  if (storeToRefs(userStore).usersS.value.length > 0) {
    return storeToRefs(userStore).usersS.value
  }
  const resp = await axios.get<ResultVO<{ users: User[] }>>('subject/users')
  const users = resp.data.data?.users
  //
  storeToRefs(userStore).usersS.value = users!
  return users ?? []
}

export const listInvisService = async (status: number) => {
  let invis: Invigilation[] = []

  // if (status == DISPATCH) {
  //   invis = storeToRefs(invisStore).invigilationsDispatchS.value
  // }
  // if (status == ASSIGN) {
  //   invis = storeToRefs(invisStore).invigilationsAssignS.value
  // }

  // if (invis.length > 0) {
  //   return invis
  // }

  const resp = await axios.get<ResultVO<{ invis: Invigilation[] }>>(
    `subject/invis/status/${status}`
  )
  invis = resp.data.data!.invis ?? []
  if (status == DISPATCH) {
    storeToRefs(invisStore).invigilationsDispatchS.value = invis
  }
  if (status == ASSIGN) {
    storeToRefs(invisStore).invigilationsAssignS.value = invis
  }

  return invis
}

//
export const updateUserInviStatusService = async (users: User[]) => {
  const resp = await axios.post<ResultVO<{ users: User[] }>>('subject/invistatus', users)

  storeToRefs(usersStore).usersS.value = resp.data.data?.users!
  return resp.data.data?.users ?? []
}

//
export const listTimetablesService = async (week: number, dayweek: number) => {
  const resp = await axios.get<ResultVO<{ timetables: Timetable[] }>>(
    `subject/timetables/weeks/${week}/dayweeks/${dayweek}`
  )
  const timetables = resp.data.data?.timetables
  if (!timetables || timetables.length == 0) return
  //
  storeToRefs(timetablesStore).timetablesS.value = timetables
  return timetables
}
export const listDateInvisService = async (date: string) => {
  const resp = await axios.get<ResultVO<{ invis: Invigilation[] }>>(`subject/invis/dates/${date}`)
  return resp.data.data?.invis ?? []
}

//
export const listCountsService = async () => {
  const resp = await axios.get<ResultVO<{ counts: InviCount[] }>>('subject/invidetails/counts')
  const counts = resp.data.data?.counts
  if (!counts || counts.length == 0) return

  //
  storeToRefs(useInviCountsStore()).inviCounts.value = counts
  return counts
}

//
export const getInviService = async (inviid: string) => {
  const currentInvi = storeToRefs(invisStore).invigilationsDispatchS.value.find(
    (invi) => invi.id == inviid
  )
  if (currentInvi) {
    return currentInvi
  }

  const resp = await axios.get<ResultVO<{ invi: Invigilation }>>(`subject/invis/${inviid}`)
  const invi = resp.data.data?.invi

  //
  storeToRefs(invisStore).currentInviS.value = invi
  return invi
}

export const addAssignUsersService = async (user: AssignUser) => {
  // @ts-ignore
  user.allocator = JSON.stringify(user.allocator)
  const resp = await axios.post('subject/invidetails', user)

  return true
}

export const listInviDetailUsersService = async (inviid: string) => {
  const resp = await axios.get<ResultVO<{ users: User[] }>>(`subject/invidetailusers/${inviid}`)
  const users = resp.data.data?.users
  return users ?? []
}

export const noticeUsersService = async (notice: Notice) => {
  const resp = await axios.post<ResultVO<{ code: string }>>('subject/assignnotices', notice)
  return resp.data.data?.code
}
