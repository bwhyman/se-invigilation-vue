import axios from '@/axios'
import type { Department, DingUser, ResultVO, User } from '@/types'
import { useUsersStore } from '@/stores/UsersStore'
import { StoreCache, StoreClear } from './descriptor'
import { useDepartmentsStore } from '@/stores/DepartmentStore'

const usersStore = useUsersStore()
const departsStore = useDepartmentsStore()

const ADMIN = 'admin'

export class AdminService {
  @StoreClear(departsStore.clear)
  @StoreCache(departsStore.collegesS)
  static async addCollegeService(name: string) {
    const resp = await axios.post<ResultVO<{ colleges: Department[] }>>(`${ADMIN}/colleges`, {
      name: name
    })
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
}
