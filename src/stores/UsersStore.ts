import { defineStore } from 'pinia'
import type { DingUser, User } from '@/types/index'

export const useUsersStore = defineStore('useUsersStore', () => {
  const usersS = ref<User[]>([])
  const dingUsersS = ref<DingUser[]>([])

  return { usersS, dingUsersS }
})
