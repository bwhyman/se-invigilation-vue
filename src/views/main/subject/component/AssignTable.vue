<script setup lang="ts">
import type { InviAssignUser, Invigilation, Timetable } from '@/types'
const props = defineProps<{
  users: InviAssignUser[]
}>()
</script>
<template>
  <el-table :data="props.users">
    <el-table-column type="index" label="#" width="50" />
    <el-table-column width="85">
      <template #default="scope">
        <slot name="userAssign" :user="scope.row as InviAssignUser"></slot>
      </template>
    </el-table-column>
    <el-table-column width="130">
      <template #default="scope">
        <el-tag>{{ scope.row.amount }}</el-tag>
        {{ scope.row.name }}
      </template>
    </el-table-column>
    <el-table-column label="当日课程">
      <template #default="scope">
        <template v-for="(tb, index) of scope.row.timetables as Timetable[]" :key="index">
          {{ tb.course?.courseName }}/{{ tb.course?.location }}/{{ tb.startweek }}-{{
            tb.endweek
          }}周；周{{ tb.dayweek }}；{{ tb.period }}节
          <br />
        </template>
      </template>
    </el-table-column>
    <el-table-column width="300" label="当日监考">
      <template #default="scope">
        <template v-for="(invi, index) of scope.row.invis as Invigilation[]" :key="index">
          {{ invi.course?.courseName }} / {{ invi.date }} {{ invi.time?.starttime }}
          <br />
        </template>
      </template>
    </el-table-column>
  </el-table>
</template>
