<script setup lang="ts">
import { listExcludeRulesService } from '@/services/SubjectService'
import { dayOfWeeksC, periodOfDaysC } from '@/services/ExcludeRule'
import AddRuleDialog from './AddRuleDialog.vue'
import { Delete } from '@element-plus/icons-vue'
import { createDialog } from './index'

const excludeRules = await listExcludeRulesService()
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <AddRuleDialog />
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
            <el-button type="danger" @click="createDialog(scope.row)" :icon="Delete" circle />
          </template>
        </el-table-column>
      </el-table>
    </el-col>
  </el-row>
</template>
