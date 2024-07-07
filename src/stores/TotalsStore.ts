const departmentTotalsMapS = ref<Map<any, number>>(new Map())
const clear = () => departmentTotalsMapS.value.clear()

const store = { departmentTotalsMapS, clear }
export const useTotalsStore = () => store
