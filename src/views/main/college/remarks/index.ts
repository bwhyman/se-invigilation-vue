import type { Invigilation } from '@/types'
import { render } from 'vue'

//
export const remarkTypeC = computed(
  () => (invi: Invigilation) =>
    invi.remark ? { type: 'success', message: invi.remark } : { type: 'primary' }
)

// 课程名称/日期/开始时间，完全相同，为同一门监考
export const listSameInvis = (invi: Invigilation, invis: Invigilation[]) => {
  const sameInvis = invis.filter(
    (i) =>
      i.course?.courseName?.trim() == invi.course?.courseName?.trim() &&
      i.date == invi.date &&
      i.time?.starttime == invi.time?.starttime
  )
  return sameInvis
}
// 创建函数式组件
export const createDialog = (invis: Invigilation[]) => {
  const node = h(
    defineAsyncComponent(() => import('./RemarkDialog.vue')),
    { invis: invis }
  )
  render(node, document.body)
}
