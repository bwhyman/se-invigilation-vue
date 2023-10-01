<script setup lang="ts">
const router = useRouter()
const activeIndexR = ref(router.currentRoute.value.path)
</script>
<template>
  <el-menu :default-active="activeIndexR" mode="horizontal" router>
    <el-menu-item index="/subject/dispatched">已下发</el-menu-item>
    <el-menu-item index="/subject/assigned">已分配</el-menu-item>
    <el-menu-item index="/subject/functions">功能</el-menu-item>
  </el-menu>
</template>
