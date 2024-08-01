<script setup lang="ts">
const route = useRoute()
const activeIndexR = ref(route.path)

const menus = [
  { name: '已下发', path: '/subject/dispatched' },
  { name: '已分配', path: '/subject/assigned' },
  { name: '查询', path: '/subject/search' },
  { name: '录入', path: '/subject/addinvi' },
  { name: '功能', path: '/subject/functions' }
]

watch(route, () => {
  const path = menus.find((r) => route.path.includes(r.path))?.path
  activeIndexR.value = path ?? ''
})
</script>
<template>
  <el-menu :default-active="activeIndexR" mode="horizontal" router>
    <el-menu-item v-for="(rout, index) of menus" :key="index" :index="rout.path">
      {{ rout.name }}
    </el-menu-item>
  </el-menu>
</template>
