import axios, { useGet, usePost } from '@/axios'
import { createElLoadingX } from '@/components/loading'
import router from '@/router'
import { useSettingStore } from '@/stores/SettingStore'
import { useUserStore } from '@/stores/UserStore'
import type {
  AssignUser,
  CancelNotice,
  Invigilation,
  Notice,
  ResultVO,
  Setting,
  User
} from '@/types'
import { querycachename } from '@/vuequery/Const'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { COLLEGE_ADMIN, SUBJECT_ADMIN, SUPER_ADMIN } from './Const'

const userStore = useUserStore()

export class CommonService {
  //
  static listInvisByDateService(
    sdate: MaybeRefOrGetter,
    edate: MaybeRefOrGetter,
    enabledR?: MaybeRefOrGetter
  ) {
    return useQuery({
      queryKey: [querycachename.dateinvis, sdate, edate],
      queryFn: () =>
        createElLoadingX(useGet<Invigilation[]>(`invis/date/${toValue(sdate)}/${toValue(edate)}`)),
      enabled: enabledR,
      placeholderData: []
    })
  }

  // login
  static loginService = async (user: User, freePwd: boolean) => {
    const data = { account: user.account, password: user.password, ltoken: freePwd }
    const resp = await axios.post<ResultVO<User>>('open/login', data)

    const token = resp.headers.token
    const role = resp.headers.role
    userStore.setUserSessionStorage(token, role)

    if (freePwd) {
      const ltoken = resp.headers.ltoken
      localStorage.setItem('ltoken', ltoken)
    }

    router.push(this.getPath(role))
  }

  static getUserInfoService() {
    return useQuery({
      queryKey: [querycachename.userinfo],
      queryFn: () => useGet<User>('info')
    })
  }

  static updateSelfPassword() {
    return useMutation({
      mutationFn: (pwd: string) => usePost('passwords', { password: pwd })
    })
  }

  //
  static freePwdService = async () => {
    const ltoken = userStore.getLKoken()
    const resp = await axios.get<ResultVO<User>>('open/l-login', {
      headers: { ltoken: ltoken }
    })
    const token = resp.headers.token
    const role = resp.headers.role
    userStore.setUserSessionStorage(token, role)
    router.push(this.getPath(role))
  }

  private static getPath(role: string) {
    let path = ''
    switch (role) {
      case SUBJECT_ADMIN:
        path = 'subject/dispatched'
        break
      case COLLEGE_ADMIN:
        path = '/college/imported'
        break
      case SUPER_ADMIN:
        path = '/admin'
        break
    }
    return path
  }

  // 发送取消监考通知，移除监考日程
  static noticeDingCancelService() {
    return useMutation({
      mutationFn: ({ notice, inviid }: { notice: CancelNotice; inviid: string }) =>
        createElLoadingX(usePost(`cancelinvinotices/${inviid}`, notice))
    })
  }

  // 清空已导入监考缓存
  static addInviSerivce() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (invi: Invigilation) => {
        // @ts-ignore
        invi.importer = JSON.stringify(invi.importer)
        // @ts-ignore
        invi.course = JSON.stringify(invi.course)
        // @ts-ignore
        invi.time = JSON.stringify(invi.time)
        return usePost(`invigilations`, invi)
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [querycachename.importeds] })
      }
    })
  }

  //
  static noticeUsersService() {
    return useMutation({
      mutationFn: (notice: Notice) => createElLoadingX(usePost('assignnotices', notice))
    })
  }

  //
  // 清空当前监考缓存
  // 清空教师监考数量缓存
  static addAssignUsersService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: ({ inviid, user }: { inviid: string; user: AssignUser }) => {
        // @ts-ignore
        user.allocator = JSON.stringify(user.allocator)
        // @ts-ignore
        user.executor = JSON.stringify(user.executor)
        return usePost(`invidetails/${inviid}`, user)
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [querycachename.importeds] })
        qc.invalidateQueries({ queryKey: [querycachename.dispatcheds] })
        qc.invalidateQueries({ queryKey: [querycachename.assigneds] })
        qc.invalidateQueries({ queryKey: [querycachename.userinvicounts] })
        qc.invalidateQueries({ queryKey: [querycachename.invitotals] })
      }
    })
  }

  //
  static listUserDingIdsService(userIds: MaybeRefOrGetter, enabled?: MaybeRefOrGetter) {
    return useQuery({
      queryKey: [querycachename.remarkdingusers, userIds],
      queryFn: () => usePost<User[]>('invinotices/dingids', toValue(userIds)),
      enabled
    })
  }

  static listSettingsService() {
    return useQuery({
      queryKey: [querycachename.settings],
      queryFn: async () => {
        const data = await useGet<Setting[]>('settings')
        const store = useSettingStore()
        store.settings.value = data
        return store
      }
    })
  }
}
