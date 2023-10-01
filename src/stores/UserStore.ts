import { defineStore } from 'pinia'
import type { User } from '@/types/index'

export const useUserStore = defineStore('userStore', () => {
  const u = sessionStorage.getItem('user')
  const userS = ref<User>(u ? JSON.parse(u) : {})

  return { userS }
})
