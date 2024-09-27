<script setup lang="ts">
import { IMPORT } from '@/services/Const'
import type { Invigilation } from '@/types'
import { Edit, Scissor, SoldOut } from '@element-plus/icons-vue'
import { assignF, cutF, editF } from './Opteration'
const props = defineProps<{ invi: Invigilation }>()
</script>
<template>
  <el-dropdown>
    <el-button type="primary" :icon="Edit" circle style="outline: none"></el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          :icon="Scissor"
          @click="cutF(invi)"
          v-if="invi?.amount && invi.amount > 1 && invi.status === IMPORT">
          剪裁
        </el-dropdown-item>
        <el-dropdown-item :icon="SoldOut" @click="assignF(props.invi)">分配</el-dropdown-item>
        <el-dropdown-item :icon="Edit" @click="editF(props.invi)">编辑</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
