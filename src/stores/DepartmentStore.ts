import type { Department } from '@/types'

const departments = ref<Department[]>([])
const departmentsOpened = ref<Department[]>([])
const clear = () => {
  departments.value = []
  departmentsOpened.value = []
}
const store = { departments, departmentsOpened, clear }
export const useDepartmentsStore = () => {
  return store
}
