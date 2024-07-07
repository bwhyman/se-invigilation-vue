import type { ExcludeRule } from '@/types'

const excludeRules = ref<ExcludeRule[]>([])
const clear = () => (excludeRules.value = [])
const store = { excludeRules, clear }
export const useExcludeRulesStore = () => store
