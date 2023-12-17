<script setup lang="ts">
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
