import type { Invigilation } from '@/types'
import { render } from 'vue'

// 创建函数式组件
export const createDialog = (invis: Invigilation[]) => {
  const node = h(
    defineAsyncComponent(() => import('./RemarkDialog.vue')),
    { invis: invis }
  )
  render(node, document.body)
}
