import type { Department } from '@/types'

const departments = shallowRef<Department[]>()
const collegesS = shallowRef<Department[]>()
const departmentsOpened = shallowRef<Department[]>()
const clear = () => {
  departments.value = undefined
  departmentsOpened.value = undefined
  collegesS.value = undefined
}
const store = { departments, departmentsOpened, collegesS, clear }
export const useDepartmentsStore = () => store
