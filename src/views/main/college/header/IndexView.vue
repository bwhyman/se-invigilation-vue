<script setup lang="ts">
const router = useRouter()
const activeIndexR = ref(router.currentRoute.value.path)
</script>
<template>
  <el-menu :default-active="activeIndexR" mode="horizontal" router>
    <el-menu-item index="/college/imported">已导入</el-menu-item>
    <el-menu-item index="/college/dispatched">已下发</el-menu-item>
    <el-menu-item index="/college/imports">添加</el-menu-item>
    <el-menu-item index="/college/functions">功能</el-menu-item>
  </el-menu>
</template>
