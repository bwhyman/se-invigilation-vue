import type { DingUser, User } from '@/types/index'

const usersS = ref<User[]>([])
const dingUsersS = ref<DingUser[]>([])
const store = { usersS, dingUsersS }
export const useUsersStore = () => {
  return store
}
