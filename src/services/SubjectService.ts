import axios from '@/axios'
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
  ResultVO,
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
    const resp = await axios.get<ResultVO<{ users: User[] }>>(`${SUBJECT}/users`)
    return resp.data.data?.users as unknown as Ref<User[]>
  }

  //
  @ELLoading()
  @StoreMapCache(invisStore.invigilationsDispatchMapS)
  static async listInvisService(status: number, page: number) {
    const resp = await axios.get<ResultVO<{ invis: Invigilation[] }>>(
      `${SUBJECT}/invis/status/${status}/${page}`
    )
    return resp.data.data!.invis as unknown as Invigilation[]
  }

  //
  @StoreMapCache(totalsStore.departmentTotalsMapS)
  static async getTotalsService(status: number) {
    const resp = await axios.get<ResultVO<{ total: number }>>(
      `${SUBJECT}/invis/status/${status}/total`
    )
    return resp.data.data?.total as unknown as number
  }

  // 改变教师状态监考状态，清空课表缓存。因为按开放教师加载的课表
  // 清空教师，全部重新加载
  @StoreClear(timetablesStore.clear, usersStore.clear)
  @StoreCache(usersStore.usersS)
  static async updateUsersInviStatuService(users: User[]) {
    const resp = await axios.post<ResultVO<{ users: User[] }>>(`${SUBJECT}/invistatus`, users)
    return resp.data.data?.users as unknown as Ref<User[]>
  }

  // 加载开放状态教师课表
  @StoreMapCache(timetablesStore.timetableMapS)
  static async listTimetablesService(week: number, dayweek: number) {
    const resp = await axios.get<ResultVO<{ timetables: Timetable[] }>>(
      `${SUBJECT}/timetables/weeks/${week}/dayweeks/${dayweek}`
    )
    return resp.data.data?.timetables as unknown as Timetable[]
  }

  //
  @StoreMapCache(invisStore.dateInvisMapS)
  static async listDateInvisService(date: string) {
    const resp = await axios.get<ResultVO<{ invis: Invigilation[] }>>(
      `${SUBJECT}/invis/dates/${date}`
    )
    return resp.data.data?.invis as unknown as Invigilation[]
  }

  //专业教师监考数量
  @StoreCache(inviCountsStore.inviCounts)
  static async listCountsService() {
    const resp = await axios.get<ResultVO<{ counts: InviCount[] }>>(`${SUBJECT}/invidetails/counts`)
    return resp.data.data?.counts as unknown as Ref<InviCount[]>
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
    await axios.post(`${SUBJECT}/invidetails/${inviid}`, user)
    return true
  }

  static listInviDetailUsersService = async (inviid: string) => {
    const resp = await axios.get<ResultVO<{ users: User[] }>>(
      `${SUBJECT}/invidetailusers/${inviid}`
    )
    const users = resp.data.data?.users
    return users ?? []
  }

  static noticeUsersService = async (notice: Notice) => {
    const resp = await axios.post<ResultVO<{ code: string }>>(`${SUBJECT}/assignnotices`, notice)
    return resp.data.data?.code
  }

  // 获取指定监考信息
  @StoreCache(invisStore.currentInviS)
  static async getInviService(inviid: string) {
    const resp = await axios.get<ResultVO<{ invi: Invigilation }>>(`${SUBJECT}/invis/${inviid}`)
    return resp.data.data?.invi as unknown as Ref<Invigilation>
  }

  //
  static getDepartmentCommentService = async () => {
    const resp = await axios.get<ResultVO<{ comment: string }>>(`${SUBJECT}/comments`)
    return resp.data.data?.comment ?? ''
  }

  //
  static addDepartmentCommentService = async (comment: string) => {
    await axios.post(`${SUBJECT}/comments`, { comment: comment })
    return true
  }

  //
  @StoreCache(excludeRulesStore.excludeRules)
  static async listExcludeRulesService() {
    const resp = await axios.get<ResultVO<{ rules: ExcludeRule[] }>>(`${SUBJECT}/excluderules`)
    return resp.data.data?.rules as unknown as Ref<ExcludeRule[]>
  }

  //
  @StoreClear(excludeRulesStore.clear)
  @StoreCache(excludeRulesStore.excludeRules)
  static async addExcludeRuleService(rule: ExcludeRule) {
    // @ts-ignore
    rule.dayweeks = JSON.stringify(rule.dayweeks)
    // @ts-ignore
    rule.periods = JSON.stringify(rule.periods)

    const resp = await axios.post<ResultVO<{ rules: ExcludeRule[] }>>(
      `${SUBJECT}/excluderules`,
      rule
    )
    return resp.data.data?.rules as unknown as Ref<ExcludeRule[]>
  }
  //
  @StoreClear(excludeRulesStore.clear)
  @StoreCache(excludeRulesStore.excludeRules)
  static async delExcludeRuleService(exid: string) {
    const resp = await axios.delete<ResultVO<{ rules: ExcludeRule[] }>>(
      `${SUBJECT}/excluderules/${exid}`
    )
    excludeRulesStore.excludeRules.value = resp.data.data?.rules ?? []
    return resp.data.data?.rules as unknown as Ref<ExcludeRule[]>
  }
}
