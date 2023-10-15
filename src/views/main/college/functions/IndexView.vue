<script setup lang="ts">
const components = [
  {
    name: '开启/关闭部门',
    component: defineAsyncComponent(() => import('./CloseDepartmentView.vue'))
  },
  {
    name: '导出详细信息',
    component: defineAsyncComponent(() => import('./InviDetailsView.vue'))
  },
  {
    name: '导入课表',
    component: defineAsyncComponent(() => import('./ReadTimetablesView.vue'))
  },
  {
    name: '重置密码',
    component: defineAsyncComponent(() => import('./ResetPasswordView.vue'))
  },
  {
    name: '更新教师部门',
    component: defineAsyncComponent(() => import('./UpdateDepartView.vue'))
  },
  {
    name: '更新教师角色',
    component: defineAsyncComponent(() => import('./UpdateRolesView.vue'))
  }
]

const currentComponentR = ref()
const currentComponentC = computed(
  () => components.find((com) => com.name == currentComponentR.value)?.component
)
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <el-tag
        v-for="(com, index) of components"
        :key="index"
        @click="currentComponentR = com.name"
        style="cursor: pointer; margin-right: 10px">
        {{ com.name }}
      </el-tag>
    </el-col>
  </el-row>
  <template v-if="currentComponentR">
    <component :is="currentComponentC" />
  </template>
</template>
