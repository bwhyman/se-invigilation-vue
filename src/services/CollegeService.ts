import { useDelete, useGet, usePatch, usePost, usePut } from '@/axios'
import { useDepartmentAvgStore } from '@/stores/DepartmentAvgStore'
import { useDepartmentsStore } from '@/stores/DepartmentStore'
import { useInvigilationsStore } from '@/stores/InvigilationsStore'
import { useSettingStore } from '@/stores/SettingStore'
import { useTotalsStore } from '@/stores/TotalsStore'
import { useUsersStore } from '@/stores/UsersStore'
import type {
  AssignUser,
  Department,
  DepartmentAvg,
  DingNoticeResponse,
  DingUser,
  InviCount,
  Invigilation,
  Notice,
  NoticeRemark,
  Setting,
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
const departmentAvgStore = useDepartmentAvgStore()
const settingStore = useSettingStore()

const addPreUrl = (url: string) => `${COLLEGE}/${url}`

export class CollegeService {
  //
  @StoreCache(departmentsStore.departmentsOpened)
  static async listOpenedDepartmentsService() {
    const data = await useGet<Department[]>(addPreUrl('departments/opened'))
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
    return await usePost<Invigilation[]>(addPreUrl('invigilations'), invis)
  }

  @StoreCache(invisStore.invigilationsImportS)
  @ELLoading()
  static async listImportedService() {
    const data = await useGet<Invigilation[]>(addPreUrl('invilations/imported'))
    return data as unknown as Ref<Invigilation[]>
  }

  static getImportedTotalService = async () => {
    const data = await useGet<number>(addPreUrl('invigilations/imported/total'))
    return data ?? 0
  }

  @StoreMapCache(depTotalsStore.totalsMapS)
  static async getDepatchedTotalService(depid: string) {
    const data = await useGet<number>(addPreUrl(`invigilations/dispatched/${depid}/total`))
    return data ?? 0
  }

  @StoreMapCache(invisStore.invigilationsDispatchMapS)
  @ELLoading()
  static async listDepatchedsService(depid: string, page: number) {
    return await useGet<Invigilation[]>(addPreUrl(`invilations/dispatched/${depid}/${page}`))
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
    const data = await usePatch<Invigilation[]>(addPreUrl('invigilations/dispatch'), invis)
    return data as unknown as Ref<Invigilation[]>
  }

  //
  @StoreCache(usersStore.usersS)
  @ELLoading()
  static async listCollegeUsersService() {
    const data = await useGet<User[]>(addPreUrl('users'))
    return data as unknown as Ref<User[]>
  }

  //
  @ELLoading()
  static async addTimetablesService(timetables: Timetable[]) {
    stringTimetables(timetables)
    await usePost(addPreUrl('timetables'), timetables)
    return true
  }

  // 加载指定专业监考分配负责人
  @StoreMapCache(usersStore.dispatchersS)
  static async listDispatchersService(depid: string) {
    return await useGet<User[]>(addPreUrl(`dispatchers/${depid}`))
  }

  @ELLoading()
  static async noticeDispatcherService(notice: Notice) {
    return await usePost<DingNoticeResponse>(addPreUrl('dispatchnotices'), notice)
  }

  //
  @ELLoading()
  static async addTimetableService(userid: string, timetables: Timetable[]) {
    stringTimetables(timetables)
    await usePost(addPreUrl(`timetables/${userid}`), timetables)
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
    const data = await usePatch<Invigilation>(addPreUrl('invigilations/edit'), invi)

    return data as unknown as Ref<Invigilation>
  }

  // 删除监考
  @StoreClear(invisStore.clear)
  static async delInviService(inviid: string) {
    await useDelete(addPreUrl(`invigilations/${inviid}`))
    return true
  }

  // 重置监考为未下发状态，重置信息等
  @StoreClear(invisStore.clear)
  static async resetInviService(inviid: string) {
    await usePut(addPreUrl(`invigilations/${inviid}/status`))
    return true
  }

  //
  @StoreCache(departmentsStore.departments)
  static async listDepartmentsService() {
    const data = await useGet<Department[]>(addPreUrl('departments'))
    return data as unknown as Ref<Department[]>
  }

  //
  @StoreClear(departmentsStore.clear)
  @StoreCache(departmentsStore.departments, true)
  static async updateDepartmentInviStatusService(departs: Department[]) {
    const data = await usePatch<Department[]>(addPreUrl('departments/invistatus'), departs)
    return data as unknown as Ref<Department[]>
  }

  // 学院直接分配
  @StoreClear(invisStore.clear, departmentAvgStore.clear)
  static async addAssignService(inviid: string, user: AssignUser) {
    // @ts-ignore
    user.allocator = JSON.stringify(user.allocator)
    // @ts-ignore
    user.executor = JSON.stringify(user.executor)
    // @ts-ignore
    user.dispatcher = JSON.stringify(user.dispatcher)
    // @ts-ignore
    user.department = JSON.stringify(user.department)
    return await usePost<Invigilation>(addPreUrl(`assigns/invis/${inviid}`), user)
  }

  //
  static getUserService = async (account: string) => {
    return await useGet<User>(addPreUrl(`users/${account}`))
  }

  //
  @StoreCache(invisStore.invisAllS)
  @ELLoading()
  static async listCollegeInviDetailsService() {
    const data = await useGet<Invigilation[]>(addPreUrl('invis/all'))
    return data as unknown as Ref<Invigilation[]>
  }

  // 获取全学院每位教师监考数量
  static listCollegeCountsService = async () => {
    return await useGet<InviCount[]>(addPreUrl('invis/counts'))
  }

  // 重置指定账号密码
  static resetPasswordService = async (account: string) => {
    await usePut(addPreUrl(`passwords/${account}`))
    return true
  }

  @StoreClear(usersStore.clear)
  static async addUserService(user: User) {
    // @ts-ignore
    user.department = JSON.stringify(user.department)
    await usePost(addPreUrl('users'), user)

    return true
  }

  //
  @ELLoading()
  static async sendInviRemarkNoticeService(notice: NoticeRemark) {
    const data = await usePost<{ request_id: string }>(addPreUrl('invinotices'), notice)
    return data.request_id ?? ''
  }

  // 获取指定学院，指定id的监考信息
  @StoreCache(invisStore.currentInviS)
  static async getCollegeInviService(inviid: string) {
    const data = await useGet<Invigilation>(addPreUrl(`invis/${inviid}`))
    return data as unknown as Ref<Invigilation>
  }

  //
  static async listUserDingIdsService(userIds: string[]) {
    return await usePost<User[]>(addPreUrl('invinotices/dingid'), userIds)
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

    const data = await usePost<Invigilation[]>(addPreUrl(`cutinvigilation/${oldInviid}`), invi)
    return data as unknown as Ref<Invigilation[]>
  }

  // 加载指定专业下全部教师
  static async listDepartmentUsersService(depid: string) {
    return await useGet<User[]>(addPreUrl(`department/${depid}/users`))
  }

  // 基于钉钉注册手机号，获取用户信息
  @ELLoading()
  static async getDingUserService(mobile: string) {
    const data = await useGet<DingUser>(addPreUrl(`mobiles/${mobile}`))
    if (!data) {
      throw '无法查询到钉钉用户'
    }
    return data
  }

  //
  @StoreClear(usersStore.clear)
  static async removeUserService(uid: string) {
    await useDelete(addPreUrl(`users/${uid}`))
    return true
  }

  //
  @StoreClear(invisStore.clear)
  static async removeCollegeDataService() {
    await useDelete(addPreUrl('colleges/datareset'))
    return true
  }

  //
  @StoreCache(departmentsStore.departments, true)
  static async removeDepartmentService(depid: string) {
    const data = await useDelete<Department[]>(addPreUrl(`departments/${depid}`))
    return data as unknown as Ref<Department[]>
  }
  // 更新部门名称
  @StoreCache(departmentsStore.departments, true)
  static async updateDepartmentNameService(depart: UserDepartment) {
    const data = await usePatch<Department[]>(addPreUrl(`departments/${depart.depId}`), depart)
    return data as unknown as Ref<Department[]>
  }

  @StoreClear(usersStore.clear)
  static async updateUserSerivce(udi: string, user: User) {
    // @ts-ignore
    user.department = JSON.stringify(user.department)
    await usePatch(addPreUrl(`users/${user.id}`), user)
    return true
  }

  @StoreClear(departmentsStore.clear)
  @StoreCache(departmentsStore.departments)
  static async addDepartmentService(depart: Department) {
    // @ts-ignore
    depart.college = JSON.stringify(depart.college)
    const data = await usePost(addPreUrl('departments'), depart)
    return data as unknown as Ref<Department[]>
  }

  @StoreCache(departmentAvgStore.depAvgS)
  private static async getAvsInfoAPI() {
    const data = await useGet<{
      departmentquantity: DepartmentAvg[]
      teacherquantity: DepartmentAvg[]
    }>(addPreUrl('invis/avg'))
    return data as unknown as Ref<{
      departmentquantity: DepartmentAvg[]
      teacherquantity: DepartmentAvg[]
    }>
  }

  static async listDepartmentAvgsService() {
    await CollegeService.getAvsInfoAPI()
    return departmentAvgStore.depAvgC
  }

  //
  @StoreCache(settingStore.settingsR)
  static async listSettingsService() {
    const data = await useGet<Setting[]>(addPreUrl('settings'))
    return data as unknown as Ref<Setting[]>
  }

  @StoreCache(settingStore.settingsR, true)
  static async updateSettingService(setting: Setting) {
    await usePost(addPreUrl('settings'), setting)
  }
}
