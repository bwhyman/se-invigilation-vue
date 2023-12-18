import axios from '@/axios'
import type { Department, DingUser, ResultVO, User } from '@/types'
import { useUsersStore } from '@/stores/UsersStore'
import { createMessageDialog } from '@/components/message'

const usersStore = useUsersStore()

const ADMIN = 'admin'

export const addCollegeService = async (name: string) => {
  const resp = await axios.post<ResultVO<{ department: { name: string; id: string } }>>(
    `${ADMIN}/colleges`,
    {
      name: name
    }
  )
  createMessageDialog(resp.data.data?.department.name ?? '')
}

//
export const listCollegesService = async () => {
  const resp = await axios.get<ResultVO<{ colleges: Department[] }>>(`${ADMIN}/colleges`)
  return resp.data.data?.colleges ?? []
}

//
export const addUsersService = async (u: {
  collId: string
  collegeName: string
  users: User[]
}) => {
  console.log(u)

  await axios.post(`${ADMIN}/users`, u)
}

//
export const getDingUsersService = async (dingdepid: string) => {
  if (usersStore.dingUsersS.length > 0) return usersStore.dingUsersS

  //
  const resp = await axios.get<ResultVO<{ users: DingUser[] }>>(`${ADMIN}/dingusers/${dingdepid}`)
  const users = resp.data.data?.users ?? []
  storeToRefs(usersStore).dingUsersS.value = users

  return users
}
