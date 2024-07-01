import axios from '@/axios'
import type { Invigilation, ResultVO, Setting, User } from '@/types'
import { COLLEGE_ADMIN, SUBJECT_ADMIN, SUPER_ADMIN } from './Const'
import { useUserStore } from '@/stores/UserStore'
import router from '@/router'
import { useSettingStore } from '@/stores/SettingStore'
import { useInvigilationsStore } from '@/stores/InvigilationsStore'

const userStore = useUserStore()

localStorage.removeItem('user')
localStorage.removeItem('role')
localStorage.removeItem('token')

// login
export const loginService = async (user: User, freePwd: boolean) => {
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

  router.push(getPath(role))
}

//
export const getSettingsService = async () => {
  const settingStore = useSettingStore()
  if (settingStore.settingsR.value.length != 0) {
    return settingStore
  }
  const resp = await axios.get<ResultVO<{ settings: Setting[] }>>('settings')
  settingStore.settingsR.value = resp.data.data?.settings ?? []
  return settingStore
}

//
export const updateSelfPassword = async (pwd: string) => {
  await axios.post('passwords', { password: pwd })
}

//
export const freePwdService = async () => {
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
  router.push(getPath(role))
}

function getPath(role: string) {
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
export const noticeDingCancelService = async (inviid: string) => {
  await axios.delete(`invinotices/${inviid}`)
}

//
export const getSelfUserService = () => {
  return userStore.userS
}
//
export const setCurrentInviService = (invi: Invigilation | undefined) => {
  const store = useInvigilationsStore()
  store.currentInviS.value = invi
}
