<script setup lang="ts">
import { dayOfWeeksC, periodOfDaysC } from '@/services/ExcludeRule'
import { SubjectService } from '@/services/SubjectService'
import type { ExcludeRule } from '@/types'
import { Delete, Plus } from '@element-plus/icons-vue'
import { render } from 'vue'

const { data: excludeRules } = SubjectService.listExcludeRulesService()
const instance = getCurrentInstance()

const openAddDialogF = () => {
  const com = defineAsyncComponent(() => import('./AddRuleDialog.vue'))
  const vnode = h(com)
  vnode.appContext = instance!.appContext
  render(vnode, document.body)
}
const openDelDialogF = (rule: ExcludeRule) => {
  const com = h(
    defineAsyncComponent(() => import('./DelRuleDialog.vue')),
    { rule }
  )
  const vnode = h(com)
  vnode.appContext = instance!.appContext
  render(vnode, document.body)
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <el-button type="primary" @click="openAddDialogF" :icon="Plus" />
      <el-table :data="excludeRules">
        <el-table-column type="index" label="" width="50" />
        <el-table-column width="130" prop="teacherName" />
        <el-table-column>
          <template #default="scope">
            {{ scope.row.startweek }} - {{ scope.row.endweek }}周
          </template>
        </el-table-column>
        <el-table-column>
          <template #default="scope">
            {{ dayOfWeeksC(scope.row.dayweeks) }}
          </template>
        </el-table-column>
        <el-table-column>
          <template #default="scope">
            {{ periodOfDaysC(scope.row.periods) }}
          </template>
        </el-table-column>
        <el-table-column width="60">
          <template #default="scope">
            <el-button type="danger" @click="openDelDialogF(scope.row)" :icon="Delete" circle />
          </template>
        </el-table-column>
      </el-table>
    </el-col>
  </el-row>
</template>
