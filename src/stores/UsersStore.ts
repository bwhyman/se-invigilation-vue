import type { DingUser, User } from '@/types/index'

const usersS = ref<User[]>([])
const dingUsersS = ref<DingUser[]>([])
export const useUsersStore = () => {
  return { usersS, dingUsersS }
}
