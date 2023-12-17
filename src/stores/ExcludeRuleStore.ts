import type { ExcludeRule } from '@/types'

export const useExcludeRulesStore = defineStore('useExcludeRulesStore', () => {
  const excludeRules = ref<ExcludeRule[]>([])
  return { excludeRules }
})
