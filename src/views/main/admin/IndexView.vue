<script setup lang="ts">
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
