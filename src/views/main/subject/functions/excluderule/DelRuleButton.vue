<script setup lang="ts">
import type { ExcludeRule } from '@/types'
import { Delete } from '@element-plus/icons-vue'
const DelDialog = defineAsyncComponent(() => import('./DelRuleConfirm.vue'))
const props = defineProps<{ rule: ExcludeRule }>()
const delDialVisable = ref(false)
</script>
<template>
  <el-button type="danger" @click="delDialVisable = true" :icon="Delete" circle />
  <Teleport to="body">
    <DelDialog :rule="props.rule" v-if="delDialVisable" />
  </Teleport>
</template>
