<script setup lang="ts">
const route = useRoute()
const activeIndexR = ref(route.path)

const menus = [
  { name: '已导入', path: '/college/imported' },
  { name: '已下发', path: '/college/dispatched' },
  { name: '处理', path: '/college/search' },
  { name: '添加', path: '/college/imports' },
  { name: '功能', path: '/college/functions' }
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
