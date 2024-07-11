<script setup lang="ts">
import type { Invigilation } from '@/types'
import { Scissor, Edit, SoldOut } from '@element-plus/icons-vue'
import { editF, assignF, cutF } from './Opteration'
const props = defineProps<{ invi: Invigilation }>()
</script>
<template>
  <el-dropdown>
    <el-button type="primary" :icon="Edit" circle style="outline: none"></el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          :icon="Scissor"
          @click="cutF(props.invi)"
          v-if="props.invi?.amount && props.invi.amount > 1">
          剪裁
        </el-dropdown-item>
        <el-dropdown-item :icon="SoldOut" @click="assignF(props.invi)">分配</el-dropdown-item>
        <el-dropdown-item :icon="Edit" @click="editF(props.invi)">编辑</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
