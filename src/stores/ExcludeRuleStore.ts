import type { ExcludeRule } from '@/types'

const excludeRules = ref<ExcludeRule[]>([])
export const useExcludeRulesStore = () => {
  return { excludeRules }
}
