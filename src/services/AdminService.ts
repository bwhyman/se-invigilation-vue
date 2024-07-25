import axios from '@/axios'
import { useDepartmentsStore } from '@/stores/DepartmentStore'
import { useUsersStore } from '@/stores/UsersStore'
import type { Department, DingUser, ResultVO, User } from '@/types'
import { StoreCache, StoreClear } from './Decorators'

const usersStore = useUsersStore()
const departsStore = useDepartmentsStore()

const ADMIN = 'admin'

export class AdminService {
  @StoreClear(departsStore.clear)
  @StoreCache(departsStore.collegesS)
  static async addCollegeService(dep: Department) {
    dep.root = 1
    const resp = await axios.post<ResultVO<{ colleges: Department[] }>>(`${ADMIN}/colleges`, dep)
    return resp.data.data?.colleges as unknown as Ref<Department[]>
  }

  //
  @StoreCache(departsStore.collegesS)
  static async listCollegesService() {
    const resp = await axios.get<ResultVO<{ colleges: Department[] }>>(`${ADMIN}/colleges`)
    return resp.data.data?.colleges as unknown as Ref<Department[]>
  }

  //
  static addUsersService = async (u: { collId: string; collegeName: string; users: User[] }) => {
    console.log(u)

    await axios.post(`${ADMIN}/users`, u)
  }

  //
  @StoreCache(usersStore.dingUsersS)
  static async getDingUsersService(dingdepid: string) {
    const resp = await axios.get<ResultVO<{ users: DingUser[] }>>(`${ADMIN}/dingusers/${dingdepid}`)
    return resp.data.data?.users as unknown as Ref<DingUser[]>
  }

  @StoreCache(usersStore.usersS)
  static async getCollegeUsersService(collid: string) {
    const resp = await axios.get<ResultVO<{ users: User[] }>>(`${ADMIN}/colleges/${collid}/users`)
    return resp.data.data?.users as unknown as Ref<User[]>
  }

  static addCollegeUserDingsService = async (collid: string, users: User[]) => {
    const resp = await axios.post(`${ADMIN}/colleges/${collid}/userdings`, users)
    return true
  }
}
