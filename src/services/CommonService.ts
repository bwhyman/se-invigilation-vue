import axios from '@/axios'
import router from '@/router'
import { useInvigilationsStore } from '@/stores/InvigilationsStore'
import { useSettingStore } from '@/stores/SettingStore'
import { useUserStore } from '@/stores/UserStore'
import type { Invigilation, ResultVO, Setting, User } from '@/types'
import { COLLEGE_ADMIN, SUBJECT_ADMIN, SUPER_ADMIN } from './Const'
import { ELLoading, StoreMapCache } from './Decorators'

const userStore = useUserStore()
const invisStore = useInvigilationsStore()

localStorage.removeItem('user')
localStorage.removeItem('role')
localStorage.removeItem('token')

export class CommonService {
  @StoreMapCache(invisStore.dateInvisMapS)
  @ELLoading()
  static async listInvisByDateService(sdate: string, edate: string) {
    const resp = await axios.get<ResultVO<{ invis: Invigilation[] }>>(
      `invis/date/${sdate}/${edate}`
    )
    return resp.data.data?.invis ?? []
  }
  // login
  static loginService = async (user: User, freePwd: boolean) => {
    const data = { account: user.account, password: user.password, ltoken: freePwd }
    const resp = await axios.post<ResultVO<{ user: User }>>('login', data)
    const us = resp.data.data?.user
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
  static getSettingsService = async () => {
    const settingStore = useSettingStore()
    if (settingStore.settingsR.value.length != 0) {
      return settingStore
    }
    const resp = await axios.get<ResultVO<{ settings: Setting[] }>>('settings')
    settingStore.settingsR.value = resp.data.data?.settings ?? []
    return settingStore
  }

  //
  static updateSelfPassword = async (pwd: string) => {
    await axios.post('passwords', { password: pwd })
  }

  //
  static freePwdService = async () => {
    const ltoken = userStore.getLKoken()
    const resp = await axios.get<ResultVO<{ user: User }>>('l-login', {
      headers: { ltoken: ltoken }
    })
    const us = resp.data.data?.user
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
    await axios.post(`cancelinvinotices/${invi.id}`, { cancelMessage: msg })
  }

  //
  static setCurrentInviService = (invi: Invigilation | undefined) => {
    const store = useInvigilationsStore()
    store.currentInviS.value = invi
  }
}
