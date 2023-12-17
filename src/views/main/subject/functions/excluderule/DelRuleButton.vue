<script setup lang="ts">
import type { ExcludeRule } from '@/types'
import { Delete } from '@element-plus/icons-vue'
import { createDialog } from './index'

const props = defineProps<{ rule: ExcludeRule }>()
</script>
<template>
  <el-button type="danger" @click="createDialog(props.rule)" :icon="Delete" circle />
</template>
