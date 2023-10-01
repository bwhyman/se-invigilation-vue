<script setup lang="ts">
import { getInviChineseDayweek, getInviWeek } from '@/services/Utils'
import type { Invigilation } from '@/types'

interface Props {
  invis: Invigilation[]
}
const props = defineProps<Props>()
const WeekC = computed(() => (date: string) => getInviWeek(date))
const dayweekC = computed(() => (date: string) => getInviChineseDayweek(date))
</script>
<template>
  <el-table :data="props.invis">
    <el-table-column type="index" label="#" width="50" />
    <el-table-column>
      <template #default="scope">
        {{ scope.row.course.teacherName }}
        <br />
        {{ scope.row.course.courseName }}
        <br />
        {{ scope.row.clazz }}
      </template>
    </el-table-column>
    <el-table-column>
      <template #default="scope">
        {{ scope.row.date }}
        <br />
        第 {{ WeekC(scope.row.date) }} 周 / {{ dayweekC(scope.row.date) }}
        <br />
        {{ scope.row.time.starttime }} -
        {{ scope.row.time.endtime }}
      </template>
    </el-table-column>
    <el-table-column>
      <template #default="scope">
        {{ scope.row.course.location }}
        <br />
        <el-tag>{{ scope.row.amount }}</el-tag>
        人
      </template>
    </el-table-column>
    <el-table-column>
      <template #default="scope">
        <template v-if="scope.row.department">
          部门：
          <el-tag>{{ scope.row.department.departmentName }}</el-tag>
          <br />
        </template>
        <template v-if="scope.row.dispatcher">
          下发：
          <el-tag>{{ scope.row.dispatcher.userName }}</el-tag>
          <br />
        </template>
        <template v-if="scope.row.importer">
          导入：
          <el-tag>{{ scope.row.importer.userName }}</el-tag>
        </template>
        <br />
        <template v-if="scope.row.allocator">
          分配：
          <el-tag>{{ scope.row.allocator.userName }}</el-tag>
          <br />
        </template>
      </template>
    </el-table-column>
    <el-table-column min-width="60">
      <template #default="scope">
        <slot name="action" :invi="scope.row as Invigilation"></slot>
      </template>
    </el-table-column>
  </el-table>
</template>
