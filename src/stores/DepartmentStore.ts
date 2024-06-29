import type { Department } from '@/types'

const departments = ref<Department[]>([])
const departmentsOpened = ref<Department[]>([])
const clear = () => {
  departments.value = []
  departmentsOpened.value = []
}

export const useDepartmentsStore = () => {
  return { departments, departmentsOpened, clear }
}
