import type { DingUser, User } from '@/types/index'

const usersS = shallowRef<User[]>()
const dingUsersS = shallowRef<DingUser[]>()

const dispatchersS = shallowRef<Map<string, User>>(new Map())

const clear = () => (usersS.value = undefined)
const store = { usersS, dingUsersS, dispatchersS, clear }
export const useUsersStore = () => store
