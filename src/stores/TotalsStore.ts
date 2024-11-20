const totalsMapS = shallowRef<Map<any, number>>(new Map())
const clear = () => totalsMapS.value.clear()

const store = { totalsMapS, clear }
export const useTotalsStore = () => store
