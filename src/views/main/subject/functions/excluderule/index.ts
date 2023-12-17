import type { ExcludeRule } from '@/types'
import { render } from 'vue'

// 创建函数式组件
export const createDialog = (rule: ExcludeRule) => {
  const node = h(
    defineAsyncComponent(() => import('./DelRuleDialog.vue')),
    { rule: rule }
  )
  render(node, document.body)
}
