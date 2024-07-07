import type { Department } from '@/types'

const departments = ref<Department[]>([])
const collegesS = ref<Department[]>([])
const departmentsOpened = ref<Department[]>([])
const clear = () => {
  departments.value = []
  departmentsOpened.value = []
  collegesS.value = []
}
const store = { departments, departmentsOpened, collegesS, clear }
export const useDepartmentsStore = () => store
