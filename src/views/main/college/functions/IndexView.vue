<script setup lang="ts">
import FunctionTag from '@/views/main/component/FunctionTag.vue'

const components: { name: string; component: Component }[] = [
  {
    name: '关闭分配',
    component: defineAsyncComponent(() => import('./CloseDepartmentView.vue'))
  },
  {
    name: '导入课表',
    component: defineAsyncComponent(() => import('./ReadTimetablesView.vue'))
  },
  {
    name: '更新用户',
    component: defineAsyncComponent(() => import('./UpdateUserView.vue'))
  },
  {
    name: '添加用户',
    component: defineAsyncComponent(() => import('./AddUserView.vue'))
  },
  {
    name: '更新部门',
    component: defineAsyncComponent(() => import('./UpdateDepartView.vue'))
  },
  {
    name: '添加部门',
    component: defineAsyncComponent(() => import('./AddDepartmentView.vue'))
  },
  {
    name: '学期初始化',
    component: defineAsyncComponent(() => import('./RemoveCollegeData.vue'))
  },
  {
    name: '导出详细信息',
    component: defineAsyncComponent(() => import('./InviDetailsView.vue'))
  }
]
</script>
<template>
  <FunctionTag :tagcoms="components" />
</template>
