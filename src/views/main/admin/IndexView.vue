<script setup lang="ts">
import FunctionTag from '@/views/main/component/FunctionTag.vue'
const components: { name: string; component: Component }[] = [
  {
    name: '学院管理',
    component: defineAsyncComponent(() => import('./AddCollegeView.vue'))
  },
  {
    name: '导入用户',
    component: defineAsyncComponent(() => import('./ImportUsersView.vue'))
  },
  {
    name: '导入学院钉钉数据',
    component: defineAsyncComponent(() => import('./ImportUserDingsView.vue'))
  },
  {
    name: '查询用户钉钉数据',
    component: defineAsyncComponent(() => import('./FindUserDingsView.vue'))
  },
  {
    name: '设置管理',
    component: defineAsyncComponent(() => import('./EditSettingsView.vue'))
  }
]
</script>
<template>
  <FunctionTag :tagcoms="components" />
</template>
