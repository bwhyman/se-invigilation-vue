import axios from '@/axios'
import type { Invigilation, ResultVO, Setting, User } from '@/types'
import { COLLEGE_ADMIN, SUBJECT_ADMIN, SUPER_ADMIN } from './Const'
import { useUserStore } from '@/stores/UserStore'
import router from '@/router'
import { useSettingStore } from '@/stores/SettingStore'
import { useMessageStore } from '@/stores/MessageStore'
import { useInvigilationsStore } from '@/stores/InvigilationsStore'

const userStore = useUserStore()
const invisStore = useInvigilationsStore()

// login
export const loginService = async (user: User) => {
  try {
    const resp = await axios.post<ResultVO<{ user: User }>>('login', user)
    const us = resp.data.data?.user
    if (!us) return
    const token = resp.headers.token
    const role = resp.headers.role
    sessionStorage.setItem('token', token)
    sessionStorage.setItem('role', role)
    storeToRefs(userStore).userS.value = us
    sessionStorage.setItem('user', JSON.stringify(us))
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
  } catch (error) {
    //
  }
}

//
export const getSettingsService = async () => {
  const resp = await axios.get<ResultVO<{ settings: Setting[] }>>('settings')
  const settingStore = useSettingStore()

  storeToRefs(settingStore).settingsR.value = resp.data.data?.settings!
}

//
export const updateSelfPassword = async (pwd: string) => {
  await axios.post('passwords', { password: pwd })
  const messageS = storeToRefs(useMessageStore()).messageS
  messageS.value = '密码更新成功'
}

//
export const getInviService = async (inviid: string) => {
  let invi = invisStore.currentInviS
  if (invi) return invi

  const resp = await axios.get<ResultVO<{ invi: Invigilation }>>(`invis/${inviid}`)
  invi = resp.data.data?.invi

  return invi
}
