import { useDelete, useGet, usePatch, usePost, usePut } from '@/axios'
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
    const data = await useGet<Department[]>(`${COLLEGE}/departments/opened`)
    return data as unknown as Ref<Department[]>
  }

  //
  @StoreCache(invisStore.invigilationsImportS, true)
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
    return await usePost<Invigilation[]>(`${COLLEGE}/invigilations`, invis)
  }

  @StoreCache(invisStore.invigilationsImportS)
  @ELLoading()
  static async listImportedService() {
    const data = await useGet<Invigilation[]>(`${COLLEGE}/invilations/imported`)
    return data as unknown as Ref<Invigilation[]>
  }

  static getImportedTotalService = async () => {
    const data = await useGet<number>(`${COLLEGE}/invigilations/imported/total`)
    return data ?? 0
  }

  @StoreMapCache(depTotalsStore.totalsMapS)
  static async getDepatchedTotalService(depid: string) {
    const data = await useGet<number>(`${COLLEGE}/invigilations/dispatched/${depid}/total`)
    return data ?? 0
  }

  @StoreMapCache(invisStore.invigilationsDispatchMapS)
  @ELLoading()
  static async listDepatchedsService(depid: string, page: number) {
    return await useGet<Invigilation[]>(`${COLLEGE}/invilations/dispatched/${depid}/${page}`)
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
    const data = await usePatch<Invigilation[]>(`${COLLEGE}/invigilations/dispatch`, invis)
    return data as unknown as Ref<Invigilation[]>
  }

  //
  @StoreCache(usersStore.usersS)
  @ELLoading()
  static async listCollegeUsersService() {
    const data = await useGet<User[]>(`${COLLEGE}/users`)
    return data as unknown as Ref<User[]>
  }

  //
  @ELLoading()
  static async addTimetablesService(timetables: Timetable[]) {
    stringTimetables(timetables)
    await usePost(`${COLLEGE}/timetables`, timetables)
    return true
  }

  // 加载指定专业监考分配负责人
  @StoreMapCache(usersStore.dispatchersS)
  static async listDispatchersService(depid: string) {
    return await useGet<User[]>(`${COLLEGE}/dispatchers/${depid}`)
  }

  @ELLoading()
  static async noticeDispatcherService(notice: Notice) {
    return await usePost<DingNoticeResponse>(`${COLLEGE}/dispatchnotices`, notice)
  }

  //
  @ELLoading()
  static async addTimetableService(userid: string, timetables: Timetable[]) {
    stringTimetables(timetables)
    await usePost(`${COLLEGE}/timetables/${userid}`, timetables)
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
    const data = await usePatch<Invigilation>(`${COLLEGE}/invigilations/edit`, invi)

    return data as unknown as Ref<Invigilation>
  }

  // 删除监考
  @StoreClear(invisStore.clear)
  static async delInviService(inviid: string) {
    await useDelete(`${COLLEGE}/invigilations/${inviid}`)
    return true
  }

  // 重置监考为未下发状态，重置信息等
  @StoreClear(invisStore.clear)
  static async resetInviService(inviid: string) {
    await usePut(`${COLLEGE}/invigilations/${inviid}/status`)
    return true
  }

  //
  @StoreCache(departmentsStore.departments)
  static async listDepartmentsService() {
    const data = await useGet<Department[]>(`${COLLEGE}/departments`)
    return data as unknown as Ref<Department[]>
  }

  //
  @StoreClear(departmentsStore.clear)
  @StoreCache(departmentsStore.departments, true)
  static async updateDepartmentInviStatusService(departs: Department[]) {
    const data = await usePatch<Department[]>(`${COLLEGE}/departments/invistatus`, departs)
    return data as unknown as Ref<Department[]>
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
    return await usePost<Invigilation>(`${COLLEGE}/assigns/invis/${inviid}`, user)
  }

  //
  static getUserService = async (account: string) => {
    return await useGet<User>(`users/${account}`)
  }

  //
  @StoreCache(invisStore.invisAllS)
  @ELLoading()
  static async listCollegeInviDetailsService() {
    const data = await useGet<Invigilation[]>(`${COLLEGE}/invis/all`)
    return data as unknown as Ref<Invigilation[]>
  }

  // 获取全学院每位教师监考数量
  static listCollegeCountsService = async () => {
    return await useGet<InviCount[]>(`${COLLEGE}/invis/counts`)
  }

  // 重置指定账号密码
  static resetPasswordService = async (account: string) => {
    await usePut(`${COLLEGE}/passwords/${account}`)
    return true
  }

  @StoreClear(usersStore.clear)
  static async addUserService(user: User) {
    // @ts-ignore
    user.department = JSON.stringify(user.department)
    await usePost(`${COLLEGE}/users`, user)

    return true
  }

  //
  @ELLoading()
  static async sendInviRemarkNoticeService(notice: NoticeRemark) {
    const data = await usePost<{ request_id: string }>(`${COLLEGE}/invinotices`, notice)
    return data.request_id ?? ''
  }

  // 获取指定学院，指定id的监考信息
  @StoreCache(invisStore.currentInviS)
  static async getCollegeInviService(inviid: string) {
    const data = await useGet<Invigilation>(`${COLLEGE}/invis/${inviid}`)
    return data as unknown as Ref<Invigilation>
  }

  //
  static async listUserDingIdsService(userIds: string[]) {
    return await usePost<User[]>(`invinotices/dingids`, userIds)
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

    const data = await usePost<Invigilation[]>(`${COLLEGE}/cutinvigilation/${oldInviid}`, invi)
    return data as unknown as Ref<Invigilation[]>
  }

  // 加载指定专业下全部教师
  static async listDepartmentUsersService(depid: string) {
    return await useGet<User[]>(`${COLLEGE}/department/${depid}/users`)
  }

  // 基于钉钉注册手机号，获取用户信息
  @ELLoading()
  static async getDingUserService(mobile: string) {
    const data = await useGet<DingUser>(`${COLLEGE}/mobiles/${mobile}`)
    if (!data) {
      throw '无法查询到钉钉用户'
    }
    return data
  }

  //
  @StoreClear(usersStore.clear)
  static async removeUserService(uid: string) {
    await useDelete(`${COLLEGE}/users/${uid}`)
    return true
  }

  //
  @StoreClear(invisStore.clear)
  static async removeCollegeDataService() {
    await useDelete(`${COLLEGE}/colleges/datareset`)
    return true
  }

  //
  @StoreCache(departmentsStore.departments, true)
  static async removeDepartmentService(depid: string) {
    const data = await useDelete<Department[]>(`${COLLEGE}/departments/${depid}`)
    return data as unknown as Ref<Department[]>
  }
  // 更新部门名称
  @StoreCache(departmentsStore.departments, true)
  static async updateDepartmentNameService(depart: UserDepartment) {
    const data = await usePatch<Department[]>(`${COLLEGE}/departments/${depart.depId}`, depart)
    return data as unknown as Ref<Department[]>
  }

  @StoreClear(usersStore.clear)
  static async updateUserSerivce(udi: string, user: User) {
    // @ts-ignore
    user.department = JSON.stringify(user.department)
    await usePatch(`${COLLEGE}/users/${user.id}`, user)
    return true
  }

  @StoreClear(departmentsStore.clear)
  @StoreCache(departmentsStore.departments)
  static async addDepartmentService(depart: Department) {
    // @ts-ignore
    depart.college = JSON.stringify(depart.college)
    const data = await usePost(`${COLLEGE}/departments`, depart)
    return data as unknown as Ref<Department[]>
  }
}
