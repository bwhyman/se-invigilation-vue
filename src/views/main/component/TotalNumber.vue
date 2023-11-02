<script setup lang="ts">
const props = defineProps<{ total: number }>()
</script>
<template>
  <span style="font-size: 14px">
    共
    <el-tag style="min-width: 35px">{{ props.total }}</el-tag>
    项
  </span>
</template>
