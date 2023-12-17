<script setup lang="ts">
import type { Invigilation } from '@/types'
import { Message } from '@element-plus/icons-vue'
import { remarkTypeC, createDialog } from './index'

const props = defineProps<{ currentInvi: Invigilation; invis: Invigilation[] }>()
</script>
<template>
  <div>
    <el-button
      :title="remarkTypeC(props.currentInvi).message"
      :type="remarkTypeC(props.currentInvi).type"
      :icon="Message"
      circle
      @click="createDialog(props.invis)" />
  </div>
</template>
