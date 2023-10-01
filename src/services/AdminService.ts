import axios from '@/axios'
import type { Department, ResultVO, User } from '@/types'
import { useMessageStore } from '../stores/MessageStore'

const messageStore = useMessageStore()

export const addCollegeService = async (name: string) => {
  const resp = await axios.post<ResultVO<{ department: { name: string; id: string } }>>(
    'admin/colleges',
    {
      name: name
    }
  )

  storeToRefs(messageStore).messageS.value = resp.data.data?.department.name ?? ''
}

//
export const listCollegesService = async () => {
  const resp = await axios.get<ResultVO<{ colleges: Department[] }>>('admin/colleges')
  return resp.data.data?.colleges ?? []
}

export const addUsersService = async (u: {
  collId: string
  collegeName: string
  users: User[]
}) => {
  const resp = await axios.post('admin/users', u)
}

//
export const addDingUsersService = async (users: User[]) => {
  const resp = await axios.post('admin/dingusers', users)
}
