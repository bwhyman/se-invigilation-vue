import { defineStore } from 'pinia'
import type { User } from '@/types/index'

export const useUsersStore = defineStore('useUsersStore', () => {
  const usersS = ref<User[]>([])

  return { usersS }
})
