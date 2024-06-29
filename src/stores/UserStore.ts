import type { User } from '@/types/index'

const u = sessionStorage.getItem('user')
const userS = ref<User>(u ? JSON.parse(u) : {})
export const useUserStore = () => {
  return { userS }
}
