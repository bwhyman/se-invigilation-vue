import { useDelete, useGet, usePost } from '@/axios'
import { useExcludeRulesStore } from '@/stores/ExcludeRuleStore'
import { useInvigilationsStore } from '@/stores/InvigilationsStore'
import { useTimetablesStore } from '@/stores/TimetableStore'
import { useTotalsStore } from '@/stores/TotalsStore'
import { useUsersStore } from '@/stores/UsersStore'
import { useInviCountsStore } from '@/stores/inviCountsStore'
import type {
  AssignUser,
  ExcludeRule,
  InviCount,
  Invigilation,
  Notice,
  Timetable,
  User
} from '@/types'
import { ELLoading, StoreCache, StoreClear, StoreMapCache } from './Decorators'

const SUBJECT = 'subject'

const usersStore = useUsersStore()
const timetablesStore = useTimetablesStore()
const inviCountsStore = useInviCountsStore()
const invisStore = useInvigilationsStore()
const excludeRulesStore = useExcludeRulesStore()
const totalsStore = useTotalsStore()

export class SubjectService {
  // 加载专业内全部教师
  @StoreCache(usersStore.usersS)
  static async listUsersService() {
    const data = await useGet<User[]>(`${SUBJECT}/users`)
    return data as unknown as Ref<User[]>
  }

  //
  @StoreMapCache(invisStore.invigilationsDispatchMapS)
  @ELLoading()
  static async listInvisService(status: number, page: number) {
    return await useGet<Invigilation[]>(`${SUBJECT}/invis/status/${status}/${page}`)
  }

  //
  @StoreMapCache(totalsStore.totalsMapS)
  static async getTotalsService(status: number) {
    return await useGet<number>(`${SUBJECT}/invis/status/${status}/total`)
  }

  // 改变教师状态监考状态，清空课表缓存。因为按开放教师加载的课表
  // 清空教师，全部重新加载
  @StoreClear(timetablesStore.clear, usersStore.clear)
  @StoreCache(usersStore.usersS)
  static async updateUsersInviStatuService(users: User[]) {
    const data = await usePost<User[]>(`${SUBJECT}/invistatus`, users)
    return data as unknown as Ref<User[]>
  }

  // 加载开放状态教师课表
  @StoreMapCache(timetablesStore.timetableMapS)
  @ELLoading()
  static async listTimetablesService(week: number, dayweek: number) {
    return await useGet<Timetable[]>(`${SUBJECT}/timetables/weeks/${week}/dayweeks/${dayweek}`)
  }

  // 加载指定日期所有监考
  @StoreMapCache(invisStore.dateInvisMapS)
  @ELLoading()
  static async listDateInvisService(date: string) {
    return await useGet<Invigilation[]>(`${SUBJECT}/invis/dates/${date}`)
  }

  //专业教师监考数量
  @StoreCache(inviCountsStore.inviCounts)
  static async listCountsService() {
    const data = await useGet<InviCount[]>(`${SUBJECT}/invidetails/counts`)
    return data as unknown as Ref<InviCount[]>
  }

  //
  // 清空当前监考缓存
  // 清空教师监考数量缓存
  @StoreClear(invisStore.clear, inviCountsStore.clear, invisStore.clearCurrentInvi)
  static async addAssignUsersService(inviid: string, user: AssignUser) {
    // @ts-ignore
    user.allocator = JSON.stringify(user.allocator)
    // @ts-ignore
    user.executor = JSON.stringify(user.executor)
    await usePost(`${SUBJECT}/invidetails/${inviid}`, user)
    return true
  }

  static listInviDetailUsersService = async (inviid: string) => {
    return await useGet<User[]>(`${SUBJECT}/invidetailusers/${inviid}`)
  }

  @ELLoading()
  static async noticeUsersService(notice: Notice) {
    const data = await usePost<string>(`${SUBJECT}/assignnotices`, notice)
    return data ?? ''
  }

  // 获取指定监考信息
  @StoreCache(invisStore.currentInviS)
  static async getInviService(inviid: string) {
    const data = await useGet<Invigilation>(`${SUBJECT}/invis/${inviid}`)
    return data as unknown as Ref<Invigilation>
  }

  //
  static getDepartmentCommentService = async () => {
    const data = await useGet<string>(`${SUBJECT}/comments`)
    return data ?? ''
  }

  //
  static addDepartmentCommentService = async (comment: string) => {
    await usePost(`${SUBJECT}/comments`, { comment: comment })
    return true
  }

  //
  @StoreCache(excludeRulesStore.excludeRules)
  static async listExcludeRulesService() {
    const data = await useGet<ExcludeRule[]>(`${SUBJECT}/excluderules`)
    return data as unknown as Ref<ExcludeRule[]>
  }

  //
  @StoreCache(excludeRulesStore.excludeRules, true)
  static async addExcludeRuleService(rule: ExcludeRule) {
    // @ts-ignore
    rule.dayweeks = JSON.stringify(rule.dayweeks)
    // @ts-ignore
    rule.periods = JSON.stringify(rule.periods)

    const data = await usePost<ExcludeRule[]>(`${SUBJECT}/excluderules`, rule)
    return data as unknown as Ref<ExcludeRule[]>
  }

  //
  @StoreCache(excludeRulesStore.excludeRules, true)
  static async delExcludeRuleService(exid: string) {
    const data = await useDelete<ExcludeRule[]>(`${SUBJECT}/excluderules/${exid}`)
    excludeRulesStore.excludeRules.value = data
    return data as unknown as Ref<ExcludeRule[]>
  }
}
