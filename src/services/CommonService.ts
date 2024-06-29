import axios from '@/axios'
import type { Invigilation, ResultVO, Setting, User } from '@/types'
import { COLLEGE_ADMIN, SUBJECT_ADMIN, SUPER_ADMIN } from './Const'
import { useUserStore } from '@/stores/UserStore'
import router from '@/router'
import { useSettingStore } from '@/stores/SettingStore'
import { useInvigilationsStore } from '@/stores/InvigilationsStore'

const userStore = useUserStore()

// login
export const loginService = async (user: User, freePwd: boolean) => {
  const resp = await axios.post<ResultVO<{ user: User }>>('login', user)
  const us = resp.data.data?.user
  if (!us) return
  const token = resp.headers.token
  const role = resp.headers.role
  sessionStorage.setItem('token', token)
  sessionStorage.setItem('role', role)
  userStore.userS.value = us
  sessionStorage.setItem('user', JSON.stringify(us))

  if (freePwd) {
    localStorage.setItem('token', token)
    localStorage.setItem('role', role)
    localStorage.setItem('user', JSON.stringify(us))
  }

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

  router.push(path)
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

export const freePwdService = () => {
  const token = localStorage.getItem('token')
  token && sessionStorage.setItem('token', token)
  const role = localStorage.getItem('role')
  role && sessionStorage.setItem('role', role)
  const ut = localStorage.getItem('user')
  if (ut) {
    sessionStorage.setItem('user', ut)
    const user = JSON.parse(ut)
    userStore.userS.value = user
  }
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

  router.push(path)
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
  console.log(store.currentInviS.value)
}
