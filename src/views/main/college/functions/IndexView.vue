<script setup lang="ts">
const components: { name: string; component: Component }[] = [
  {
    name: '关闭分配',
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
    component: defineAsyncComponent(() => import('./UpdateUserDepart.vue'))
  },
  {
    name: '更新教师角色',
    component: defineAsyncComponent(() => import('./UpdateRolesView.vue'))
  },
  {
    name: '添加用户',
    component: defineAsyncComponent(() => import('./AddUserView.vue'))
  },
  {
    name: '移除用户',
    component: defineAsyncComponent(() => import('./RemoveUserView.vue'))
  },
  {
    name: '移除全部监考信息',
    component: defineAsyncComponent(() => import('./RemoveCollegeInvis.vue'))
  }
]

const currentComponentR = ref()
const currentComponentC = computed(
  () => components.find((com) => com.name == currentComponentR.value)?.component
)
const typeC = computed(() => (name: string) => (name == currentComponentR.value ? 'danger' : ''))
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <el-tag
        v-for="(com, index) of components"
        :type="typeC(com.name)"
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
