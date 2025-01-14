import { useDelete, useGet, usePost } from '@/axios'
import { useExcludeRulesStore } from '@/stores/ExcludeRuleStore'
import { useInvigilationsStore } from '@/stores/InvigilationsStore'
import { useSettingStore } from '@/stores/SettingStore'
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
  Setting,
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
const settingStore = useSettingStore()

const addPreUrl = (url: string) => `${SUBJECT}/${url}`

export class SubjectService {
  // 加载专业内全部教师
  @StoreCache(usersStore.usersS)
  static async listUsersService() {
    const data = await useGet<User[]>(addPreUrl('users'))
    return data as unknown as Ref<User[]>
  }

  @StoreCache(invisStore.invigilationsDispatchedS)
  @ELLoading()
  static async listDispatchedsService() {
    return await useGet<Invigilation[]>(addPreUrl('invis/dispatcheds'))
  }

  //
  @StoreMapCache(invisStore.invigilationsDispatchMapS)
  @ELLoading()
  static async listInvisService(status: number, page: number) {
    return await useGet<Invigilation[]>(addPreUrl(`invis/status/${status}/${page}`))
  }

  //
  @StoreMapCache(totalsStore.totalsMapS)
  static async getTotalsService(status: number) {
    return await useGet<number>(addPreUrl(`invis/status/${status}/total`))
  }

  // 改变教师状态监考状态，清空课表缓存。因为按开放教师加载的课表
  // 清空教师，全部重新加载
  @StoreClear(timetablesStore.clear, usersStore.clear)
  @StoreCache(usersStore.usersS)
  static async updateUsersInviStatuService(users: User[]) {
    const data = await usePost<User[]>(addPreUrl('invistatus'), users)
    return data as unknown as Ref<User[]>
  }

  // 加载开放状态教师课表
  @StoreMapCache(timetablesStore.timetableMapS)
  @ELLoading()
  static async listTimetablesService(week: number, dayweek: number) {
    return await useGet<Timetable[]>(addPreUrl(`timetables/weeks/${week}/dayweeks/${dayweek}`))
  }

  // 加载指定日期所有监考
  @StoreMapCache(invisStore.dateInvisMapS)
  @ELLoading()
  static async listDateInvisService(date: string) {
    return await useGet<Invigilation[]>(addPreUrl(`invis/dates/${date}`))
  }

  //专业教师监考数量
  @StoreCache(inviCountsStore.inviCounts)
  static async listCountsService() {
    const data = await useGet<InviCount[]>(addPreUrl('invidetails/counts'))
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
    await usePost(addPreUrl(`invidetails/${inviid}`), user)
    return true
  }

  static listInviDetailUsersService = async (inviid: string) => {
    return await useGet<User[]>(addPreUrl(`invidetailusers/${inviid}`))
  }

  @ELLoading()
  static async noticeUsersService(notice: Notice) {
    const data = await usePost<string>(addPreUrl('assignnotices'), notice)
    return data ?? ''
  }

  // 获取指定监考信息
  @StoreCache(invisStore.currentInviS)
  static async getInviService(inviid: string) {
    const data = await useGet<Invigilation>(addPreUrl(`invis/${inviid}`))
    return data as unknown as Ref<Invigilation>
  }

  //
  static getDepartmentCommentService = async () => {
    const data = await useGet<string>(addPreUrl('comments'))
    return data ?? ''
  }

  //
  static addDepartmentCommentService = async (comment: string) => {
    await usePost(addPreUrl('comments'), { comment: comment })
    return true
  }

  //
  @StoreCache(excludeRulesStore.excludeRules)
  static async listExcludeRulesService() {
    const data = await useGet<ExcludeRule[]>(addPreUrl('excluderules'))
    return data as unknown as Ref<ExcludeRule[]>
  }

  //
  @StoreCache(excludeRulesStore.excludeRules, true)
  static async addExcludeRuleService(rule: ExcludeRule) {
    // @ts-ignore
    rule.dayweeks = JSON.stringify(rule.dayweeks)
    // @ts-ignore
    rule.periods = JSON.stringify(rule.periods)

    const data = await usePost<ExcludeRule[]>(addPreUrl('excluderules'), rule)
    return data as unknown as Ref<ExcludeRule[]>
  }

  //
  @StoreCache(excludeRulesStore.excludeRules, true)
  static async delExcludeRuleService(exid: string) {
    const data = await useDelete<ExcludeRule[]>(addPreUrl(`excluderules/${exid}`))
    excludeRulesStore.excludeRules.value = data
    return data as unknown as Ref<ExcludeRule[]>
  }

  static async listDepartInvisAllService() {
    const data = await useGet<Invigilation[]>(addPreUrl('invis/all'))
    return data
  }

  //
  @StoreCache(settingStore.settingsR)
  static async listSettingsService() {
    const data = await useGet<Setting[]>(addPreUrl('settings'))
    return data as unknown as Ref<Setting[]>
  }
}
