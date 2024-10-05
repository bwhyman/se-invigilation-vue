import { useGet, usePatch, usePost } from '@/axios'
import { useDepartmentsStore } from '@/stores/DepartmentStore'
import { useSettingStore } from '@/stores/SettingStore'
import { useUsersStore } from '@/stores/UsersStore'
import type { Department, DingUser, Setting, User } from '@/types'
import { StoreCache } from './Decorators'

const usersStore = useUsersStore()
const departsStore = useDepartmentsStore()
const settingStore = useSettingStore()

const ADMIN = 'admin'

export class AdminService {
  @StoreCache(departsStore.collegesS, true)
  static async addCollegeService(dep: Department) {
    dep.root = 1
    const data = await usePost<Department[]>(`${ADMIN}/colleges`, dep)
    return data as unknown as Ref<Department[]>
  }

  //
  @StoreCache(departsStore.collegesS)
  static async listCollegesService() {
    const data = await useGet<Department[]>(`${ADMIN}/colleges`)
    return data as unknown as Ref<Department[]>
  }

  //
  static addUsersService = async (u: { collId: string; collegeName: string; users: User[] }) => {
    console.log(u)

    await usePost(`${ADMIN}/users`, u)
  }

  //
  @StoreCache(usersStore.dingUsersS)
  static async getDingUsersService(dingdepid: string) {
    const data = await useGet<DingUser[]>(`${ADMIN}/dingusers/${dingdepid}`)
    return data as unknown as Ref<DingUser[]>
  }

  @StoreCache(usersStore.usersS)
  static async getCollegeUsersService(collid: string) {
    const data = await useGet<User[]>(`${ADMIN}/colleges/${collid}/users`)
    return data as unknown as Ref<User[]>
  }

  static addCollegeUserDingsService = async (collid: string, users: User[]) => {
    await usePost(`${ADMIN}/colleges/${collid}/userdings`, users)
    return true
  }

  @StoreCache(settingStore.settingsR, true)
  static async updateSettingService(setting: Setting) {
    const data = await usePatch<Setting[]>(`${ADMIN}/settings`, setting)
    return data as unknown as Ref<Setting[]>
  }
}
