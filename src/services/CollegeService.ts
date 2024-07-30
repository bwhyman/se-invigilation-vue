import axios from '@/axios'
import { useDepartmentsStore } from '@/stores/DepartmentStore'
import { useInvigilationsStore } from '@/stores/InvigilationsStore'
import { useTotalsStore } from '@/stores/TotalsStore'
import { useUsersStore } from '@/stores/UsersStore'
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
import { ELLoading, StoreCache, StoreClear, StoreMapCache } from './Decorators'
import { stringTimetables } from './Utils'

const COLLEGE = 'college'

//
const departmentsStore = useDepartmentsStore()
const usersStore = useUsersStore()
const invisStore = useInvigilationsStore()
const depTotalsStore = useTotalsStore()

export class CollegeService {
  //
  @StoreCache(departmentsStore.departmentsOpened)
  static async listOpenedDepartmentsService() {
    const resp = await axios.get<ResultVO<{ departments: Department[] }>>(
      `${COLLEGE}/departments/opened`
    )
    return resp.data.data!.departments as unknown as Ref<Department[]>
  }

  //
  @StoreClear(invisStore.clear)
  static async addInvigilationsService(invis: Invigilation[]) {
    invis.forEach((i) => {
      // @ts-ignore
      i.time = JSON.stringify(i.time)
      // @ts-ignore
      i.course = JSON.stringify(i.course)
      // @ts-ignore
      i.importer = JSON.stringify(i.importer)
      // @ts-ignore
      i.allocator && (i.allocator = JSON.stringify(i.allocator))
      // @ts-ignore
      i.executor && (i.executor = JSON.stringify(i.executor))
      // @ts-ignore
      i.dispatcher && (i.dispatcher = JSON.stringify(i.dispatcher))
      // @ts-ignore
      i.department && (i.department = JSON.stringify(i.department))
    })

    const resp = await axios.post<ResultVO<{ invis: Invigilation[] }>>(
      `${COLLEGE}/invigilations`,
      invis
    )
    return resp.data.data?.invis ?? []
  }

  @StoreCache(invisStore.invigilationsImportS)
  static async listImportedService() {
    const resp = await axios.get<ResultVO<{ invis: Invigilation[] }>>(
      `${COLLEGE}/invilations/imported`
    )
    return resp.data.data!.invis as unknown as Ref<Invigilation[]>
  }

  static getImportedTotalService = async () => {
    const resp = await axios.get<ResultVO<{ total: number }>>(
      `${COLLEGE}/invigilations/imported/total`
    )
    return resp.data.data?.total ?? 0
  }

  @StoreMapCache(depTotalsStore.totalsMapS)
  static async getDepatchedTotalService(depid: string) {
    const resp = await axios.get<ResultVO<{ total: number }>>(
      `${COLLEGE}/invigilations/dispatched/${depid}/total`
    )
    return resp.data.data?.total ?? 0
  }

  @ELLoading()
  @StoreMapCache(invisStore.invigilationsDispatchMapS)
  static async listDepatchedsService(depid: string, page: number) {
    const resp = await axios.get<ResultVO<{ invis: Invigilation[] }>>(
      `${COLLEGE}/invilations/dispatched/${depid}/${page}`
    )
    return resp.data.data?.invis ?? []
  }

  //
  // 清空已导入监考缓存
  @StoreClear(invisStore.clear)
  @StoreCache(invisStore.invigilationsImportS)
  static async dispathInvisService(invis: Invigilation[]) {
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
    return resp.data.data?.invis as unknown as Ref<Invigilation[]>
  }

  //
  @StoreCache(usersStore.usersS)
  static async listCollegeUsersService() {
    const resp = await axios.get<ResultVO<{ users: User[] }>>(`${COLLEGE}/users`)
    return resp.data.data?.users as unknown as Ref<User[]>
  }

  //
  @ELLoading()
  static async addTimetablesService(timetables: Timetable[]) {
    stringTimetables(timetables)
    await axios.post(`${COLLEGE}/timetables`, timetables)

    return true
  }

  // 加载指定专业监考分配负责人
  @StoreMapCache(usersStore.dispatchersS)
  static async listDispatchersService(depid: string) {
    const resp = await axios.get<ResultVO<{ users: User[] }>>(`${COLLEGE}/dispatchers/${depid}`)
    return resp.data.data?.users ?? []
  }

  static noticeDispatcherService = async (notice: Notice) => {
    const resp = await axios.post<ResultVO<{ dingResp: DingNoticeResponse }>>(
      `${COLLEGE}/dispatchnotices`,
      notice
    )
    const dingResp = resp.data.data?.dingResp
    return dingResp
  }

  //
  // 清空已导入监考缓存
  @StoreClear(invisStore.clear)
  static async addInviSerivce(invi: Invigilation) {
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
  @ELLoading()
  static async addTimetableService(userid: string, timetables: Timetable[]) {
    stringTimetables(timetables)
    await axios.post(`${COLLEGE}/timetables/${userid}`, timetables)
    return true
  }

  //
  @StoreClear(invisStore.clear, invisStore.clearCurrentInvi)
  @StoreCache(invisStore.currentInviS)
  static async updateInviService(invi: Invigilation) {
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

    return resp.data.data?.invi as unknown as Ref<Invigilation>
  }

  // 删除监考
  @StoreClear(invisStore.clear)
  static async delInviService(inviid: string) {
    await axios.delete(`${COLLEGE}/invigilations/${inviid}`)
    return true
  }

  // 重置监考为未下发状态，重置信息等
  @StoreClear(invisStore.clear)
  static async resetInviService(inviid: string) {
    await axios.put(`${COLLEGE}/invigilations/${inviid}/status`)
    return true
  }

  //
  @StoreCache(departmentsStore.departments)
  static async listDepartmentsService() {
    const resp = await axios.get<ResultVO<{ departments: Department[] }>>(`${COLLEGE}/departments`)
    return resp.data.data?.departments as unknown as Ref<Department[]>
  }

  //
  @StoreClear(departmentsStore.clear)
  @StoreCache(departmentsStore.departments, true)
  static async updateDepartmentInviStatusService(departs: Department[]) {
    const resp = await axios.patch<ResultVO<{ departments: Department[] }>>(
      `${COLLEGE}/departments/invistatus`,
      departs
    )
    return resp.data.data?.departments as unknown as Ref<Department[]>
  }

  // 学院直接分配
  @StoreClear(invisStore.clear)
  static async addAssignService(inviid: string, user: AssignUser) {
    // @ts-ignore
    user.allocator = JSON.stringify(user.allocator)
    // @ts-ignore
    user.executor = JSON.stringify(user.executor)
    // @ts-ignore
    user.dispatcher = JSON.stringify(user.dispatcher)
    // @ts-ignore
    user.department = JSON.stringify(user.department)
    const resp = await axios.post<ResultVO<{ invi: Invigilation }>>(
      `${COLLEGE}/assigns/invis/${inviid}`,
      user
    )
    return resp.data.data?.invi
  }

  //
  static getUserService = async (account: string) => {
    const resp = await axios.get<ResultVO<{ user: User }>>(`users/${account}`)
    return resp.data.data?.user
  }

  //
  @ELLoading()
  @StoreCache(invisStore.invisAllS)
  static async listCollegeInviDetailsService() {
    const resp = await axios.get<ResultVO<{ invis: Invigilation[] }>>(`${COLLEGE}/invis/all`)
    return resp.data.data?.invis as unknown as Ref<Invigilation[]>
  }

  // 获取全学院每位教师监考数量
  static listCollegeCountsService = async () => {
    const resp = await axios.get<ResultVO<{ counts: InviCount[] }>>(`${COLLEGE}/invis/counts`)

    return resp.data.data?.counts ?? []
  }

  // 重置指定账号密码
  static resetPasswordService = async (account: string) => {
    await axios.put(`${COLLEGE}/passwords/${account}`)

    return true
  }

  @StoreClear(usersStore.clear)
  static async addUserService(user: User) {
    // @ts-ignore
    user.department = JSON.stringify(user.department)
    await axios.post(`${COLLEGE}/users`, user)

    return true
  }

  //
  static sendInviRemarkNoticeService = async (notice: NoticeRemark) => {
    const resp = await axios.post<ResultVO<{ result: { request_id: string } }>>(
      `${COLLEGE}/invinotices`,
      notice
    )
    return resp.data.data?.result.request_id ?? ''
  }

  // 获取指定学院，指定id的监考信息
  @StoreCache(invisStore.currentInviS)
  static async getCollegeInviService(inviid: string) {
    const resp = await axios.get<ResultVO<{ invi: Invigilation }>>(`${COLLEGE}/invis/${inviid}`)
    return resp.data.data?.invi as unknown as Ref<Invigilation>
  }

  //
  static listUserDingIdsService = async (userIds: string[]) => {
    const resp = await axios.post<ResultVO<{ users: User[] }>>(`invinotices/dingids`, userIds)
    return resp.data.data?.users ?? []
  }

  //
  // 清空已导入监考缓存
  @StoreClear(invisStore.clear)
  @StoreCache(invisStore.invigilationsImportS)
  static async cutInviService(oldInviid: string, invi: Invigilation) {
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
    return resp.data.data?.invis as unknown as Ref<Invigilation[]>
  }

  // 用于学院自己分配时，加载指定专业下全部教师
  static listDepartmentUsersService = async (depid: string) => {
    const resp = await axios.get<ResultVO<{ users: User[] }>>(
      `${COLLEGE}/department/${depid}/users`
    )
    return resp.data.data?.users ?? []
  }

  // 基于钉钉注册手机号，获取用户信息
  @ELLoading()
  static async getDingUserService(mobile: string) {
    const resp = await axios.get<ResultVO<{ dinguser: DingUser }>>(`${COLLEGE}/mobiles/${mobile}`)
    return resp.data.data?.dinguser
  }

  //
  @StoreClear(usersStore.clear)
  static async removeUserService(uid: string) {
    await axios.delete(`${COLLEGE}/users/${uid}`)
    return true
  }

  //
  @StoreClear(invisStore.clear)
  static async removeCollegeDataService() {
    await axios.delete(`${COLLEGE}/colleges/datareset`)
    return true
  }

  //
  @StoreCache(departmentsStore.departments, true)
  static async removeDepartmentService(depid: string) {
    const resp = await axios.delete<ResultVO<{ departments: Department[] }>>(
      `${COLLEGE}/departments/${depid}`
    )
    return resp.data.data?.departments as unknown as Ref<Department[]>
  }
  // 更新部门名称
  @StoreCache(departmentsStore.departments, true)
  static async updateDepartmentNameService(depart: UserDepartment) {
    const resp = await axios.patch<ResultVO<{ departments: Department[] }>>(
      `${COLLEGE}/departments/${depart.depId}`,
      depart
    )
    return resp.data.data?.departments as unknown as Ref<Department[]>
  }

  @StoreClear(usersStore.clear)
  static async updateUserSerivce(udi: string, user: User) {
    // @ts-ignore
    user.department = JSON.stringify(user.department)
    const resp = await axios.patch(`${COLLEGE}/users/${user.id}`, user)
    return true
  }
}
