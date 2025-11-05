import { useDelete, useGet, usePost } from '@/axios'
import { createElLoadingX } from '@/components/loading'
import type { ExcludeRule, InviCount, Invigilation, Timetable, User } from '@/types'
import { querycachename } from '@/vuequery/Const'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'

const addPreUrl = (url: string) => `subject/${url}`

export class SubjectService {
  // 加载专业内全部教师
  static listUsersService(enabled: MaybeRefOrGetter = ref(true)) {
    return useQuery({
      queryKey: [querycachename.users],
      queryFn: () => useGet<User[]>(addPreUrl('teachers')),
      enabled: enabled
    })
  }

  static listDispatchedsService() {
    return useQuery({
      queryKey: [querycachename.dispatcheds],
      queryFn: () => createElLoadingX(useGet<Invigilation[]>(addPreUrl('invis/dispatcheds')))
    })
  }

  //
  static listAssignedsService(pageR: MaybeRefOrGetter<number>) {
    return useQuery({
      queryKey: [querycachename.assigneds, pageR],
      queryFn: () =>
        createElLoadingX(useGet<Invigilation[]>(addPreUrl(`invis/assigneds/${toValue(pageR)}`)))
    })
  }

  //
  static getTotalsService(status: number) {
    return useQuery({
      queryKey: [querycachename.invitotals, status],
      queryFn: () => useGet<number>(addPreUrl(`invis/status/${status}/total`))
    })
  }

  // 改变教师状态监考状态，清空课表缓存。因为按开放教师加载的课表
  static updateUsersInviStatuService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (users: User[]) => usePost<User[]>(addPreUrl('invistatus'), users),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [querycachename.users] })
        qc.invalidateQueries({ queryKey: [querycachename.timetables] })
      }
    })
  }

  // 加载开放状态教师课表
  static listTimetablesService(week: number, dayweek: number) {
    return useQuery({
      queryKey: [querycachename.timetables, week, dayweek],
      queryFn: () => useGet<Timetable[]>(addPreUrl(`timetables/weeks/${week}/dayweeks/${dayweek}`))
    })
  }

  // 加载指定日期所有监考
  static listDateInvisService(date: string) {
    return useQuery({
      queryKey: [querycachename.dateinvis, date],
      queryFn: () => useGet<Invigilation[]>(addPreUrl(`invis/dates/${date}`))
    })
  }

  //专业教师监考数量
  static listCountsService() {
    return useQuery({
      queryKey: [querycachename.userinvicounts],
      queryFn: () => useGet<InviCount[]>(addPreUrl('invidetails/counts'))
    })
  }

  //
  static listInviDetailUsersService(inviid: MaybeRefOrGetter, enabled?: MaybeRefOrGetter) {
    return useQuery({
      queryKey: [querycachename.invidetailusers, inviid],
      queryFn: () => useGet<User[]>(addPreUrl(`invidetailusers/${toValue(inviid)}`)),
      enabled
    })
  }

  // 获取指定监考信息
  static getInviService(inviid: string) {
    return useQuery({
      queryKey: [querycachename.currentinvi],
      queryFn: () => useGet<Invigilation>(addPreUrl(`invis/${inviid}`)),
      staleTime: 0
    })
  }

  //
  static getCommentService() {
    return useQuery({
      queryKey: [querycachename.comments],
      queryFn: () => useGet<string>(addPreUrl('comments'))
    })
  }

  //
  static addCommentService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (comment: string) => usePost(addPreUrl('comments'), { comment: comment }),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [querycachename.comments] })
      }
    })
  }

  //
  static listExcludeRulesService() {
    return useQuery({
      queryKey: [querycachename.excluderules],
      queryFn: () => useGet<ExcludeRule[]>(addPreUrl('excluderules'))
    })
  }

  static addExcludeRuleService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (rule: ExcludeRule) => {
        // @ts-ignore
        rule.dayweeks = JSON.stringify(rule.dayweeks)
        // @ts-ignore
        rule.periods = JSON.stringify(rule.periods)
        return usePost<ExcludeRule[]>(addPreUrl('excluderules'), rule)
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [querycachename.excluderules] })
      }
    })
  }

  //
  static delExcludeRuleService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (exid: string) => useDelete<ExcludeRule[]>(addPreUrl(`excluderules/${exid}`)),
      onSuccess: () => qc.invalidateQueries({ queryKey: [querycachename.excluderules] })
    })
  }

  //
  static listDepartInvisAllService(enabled: MaybeRefOrGetter) {
    return useQuery({
      queryKey: [querycachename.departallinvis],
      queryFn: () => useGet<Invigilation[]>(addPreUrl('invis/all')),
      enabled
    })
  }
}
