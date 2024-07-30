import type { Department } from '@/types'

const departments = ref<Department[]>()
const collegesS = ref<Department[]>()
const departmentsOpened = ref<Department[]>()
const clear = () => {
  departments.value = undefined
  departmentsOpened.value = undefined
  collegesS.value = undefined
}
const store = { departments, departmentsOpened, collegesS, clear }
export const useDepartmentsStore = () => store
