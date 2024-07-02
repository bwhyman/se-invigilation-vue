import type { ExcludeRule } from '@/types'

const excludeRules = ref<ExcludeRule[]>([])
const store = { excludeRules }
export const useExcludeRulesStore = () => {
  return store
}
