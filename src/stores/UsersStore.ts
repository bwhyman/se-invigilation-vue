import type { DingUser, User } from '@/types/index'

const usersS = ref<User[]>()
const dingUsersS = ref<DingUser[]>()

const dispatchersS = ref<Map<string, User>>(new Map())

const clear = () => (usersS.value = undefined)
const store = { usersS, dingUsersS, dispatchersS, clear }
export const useUsersStore = () => store
