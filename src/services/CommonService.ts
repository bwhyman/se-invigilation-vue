import axios, { useGet, usePost } from '@/axios'
import router from '@/router'
import { useInvigilationsStore } from '@/stores/InvigilationsStore'
import { useSettingStore } from '@/stores/SettingStore'
import { useUserStore } from '@/stores/UserStore'
import type { Invigilation, ResultVO, Setting, User } from '@/types'
import { COLLEGE_ADMIN, SUBJECT_ADMIN, SUPER_ADMIN } from './Const'
import { ELLoading, StoreCache, StoreClear, StoreMapCache } from './Decorators'

const userStore = useUserStore()
const invisStore = useInvigilationsStore()
const settingStore = useSettingStore()

localStorage.removeItem('user')
localStorage.removeItem('role')
localStorage.removeItem('token')

export class CommonService {
  @StoreMapCache(invisStore.dateInvisMapS)
  @ELLoading()
  static async listInvisByDateService(sdate: string, edate: string) {
    return await useGet<Invigilation[]>(`invis/date/${sdate}/${edate}`)
  }
  // login
  static loginService = async (user: User, freePwd: boolean) => {
    const data = { account: user.account, password: user.password, ltoken: freePwd }
    const resp = await axios.post<ResultVO<User>>('login', data)
    const us = resp.data.data
    if (!us) {
      throw '登录错误，请重新登录'
    }
    const token = resp.headers.token
    const role = resp.headers.role
    userStore.setUserSessionStorage(us, token, role)

    if (freePwd) {
      const ltoken = resp.headers.ltoken
      us.name && userStore.setLocalStorage(us.name)
      localStorage.setItem('ltoken', ltoken)
    }

    router.push(this.getPath(role))
  }

  //
  @StoreCache(settingStore.settingsR)
  static async getSettingsService() {
    const data = await useGet<Setting[]>('settings')
    return data as unknown as Ref<Setting[]>
  }

  //
  static updateSelfPassword = async (pwd: string) => {
    await usePost('passwords', { password: pwd })
  }

  //
  static freePwdService = async () => {
    const ltoken = userStore.getLKoken()
    const resp = await axios.get<ResultVO<User>>('l-login', {
      headers: { ltoken: ltoken }
    })
    const us = resp.data.data
    if (!us) {
      throw '登录错误，请重新登录'
    }
    us.name && userStore.setLocalStorage(us.name)
    const token = resp.headers.token
    const role = resp.headers.role
    userStore.setUserSessionStorage(us, token, role)
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
  @ELLoading()
  static async noticeDingCancelService(invi: Invigilation) {
    const time = `${invi.date} ${invi.time?.starttime}`
    const msg = `监考取消：${invi.course?.courseName}; ${time}`
    await usePost(`cancelinvinotices/${invi.id}`, { cancelMessage: msg })
  }

  //
  static setCurrentInviService = (invi: Invigilation | undefined) => {
    const store = useInvigilationsStore()
    store.currentInviS.value = invi
  }

  // 清空已导入监考缓存
  @StoreClear(invisStore.clear)
  static async addInviSerivce(invi: Invigilation) {
    // @ts-ignore
    invi.importer = JSON.stringify(invi.importer)
    // @ts-ignore
    invi.course = JSON.stringify(invi.course)
    // @ts-ignore
    invi.time = JSON.stringify(invi.time)

    await usePost(`invigilations`, invi)
    return true
  }
}
