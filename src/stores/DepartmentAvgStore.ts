import type { DepartmentAvg } from '@/types'

const depAvgS = shallowRef<{
  departmentquantity: DepartmentAvg[]
  teacherquantity: DepartmentAvg[]
}>()

const depAvgMap = new Map<string, string>()

const depAvgC = computed(() => {
  depAvgS.value?.departmentquantity.map((dep) => {
    const teacherQuantity =
      depAvgS.value?.teacherquantity.find((dept) => dept.depId === dep.depId)?.teacherQuantity ?? 1
    depAvgMap.set(dep.depId!, ((dep.departmentQuantity ?? 1) / teacherQuantity).toFixed(1))
  })
  return depAvgMap
})

export const useDepartmentAvgStore = () => ({
  depAvgS,
  depAvgC
})
