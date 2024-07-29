<script setup lang="ts">
import FunctionTag from '@/views/main/component/FunctionTag.vue'
const components: { name: string; component: Component }[] = [
  {
    name: '关闭分配',
    component: defineAsyncComponent(() => import('./CloseTeacherView.vue'))
  },
  {
    name: '备注说明',
    component: defineAsyncComponent(() => import('./CommentView.vue'))
  },
  {
    name: '排除规则',
    component: defineAsyncComponent(() => import('./excluderule/IndexView.vue'))
  },
  {
    name: '监考统计',
    component: defineAsyncComponent(() => import('./StatisticView.vue'))
  }
]
</script>
<template>
  <FunctionTag :tagcoms="components" />
</template>
