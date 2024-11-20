import type { ExcludeRule } from '@/types'

const excludeRules = shallowRef<ExcludeRule[]>()
const clear = () => (excludeRules.value = undefined)
const store = { excludeRules, clear }
export const useExcludeRulesStore = () => store
