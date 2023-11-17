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
        <template v-if="props.invi.amount! > 1">
          <el-dropdown-item :icon="Scissor" @click="cutF(props.invi)">剪裁</el-dropdown-item>
        </template>

        <template v-if="props.invi.amount == 1">
          <el-dropdown-item :icon="SoldOut" @click="assignF(props.invi)">分配</el-dropdown-item>
        </template>

        <el-dropdown-item :icon="Edit" @click="editF(props.invi)">编辑</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
