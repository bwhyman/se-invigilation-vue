<script setup lang="ts">
import type { ExcludeRule, InviAssignUser, Invigilation, Timetable } from '@/types'
import { dayOfWeeksC, periodOfDaysC } from '@/services/ExcludeRule'

const props = defineProps<{
  users: InviAssignUser[]
  dayweek: string
}>()
</script>
<template>
  <el-table :data="props.users">
    <el-table-column type="index" label="" width="50" />
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
        <p :class="{ red: scope.row.reason == 'timetable' }">
          <template v-for="(tb, index) of scope.row.timetables as Timetable[]" :key="index">
            {{ tb.course?.courseName }}/{{ tb.startweek }}-{{ tb.endweek }}周；{{
              props.dayweek
            }}；{{ tb.period }}节 / {{ tb.course?.location }}/ {{ tb.course?.clazz }}
            <br />
          </template>
        </p>
      </template>
    </el-table-column>
    <el-table-column width="300" label="当日监考">
      <template #default="scope">
        <p :class="{ red: scope.row.reason == 'invi' }">
          <template v-for="(invi, index) of scope.row.invis as Invigilation[]" :key="index">
            {{ invi.course?.courseName }}/{{ invi.date }} {{ invi.time?.starttime }}/{{
              invi.course?.location
            }}
            <br />
          </template>
        </p>
      </template>
    </el-table-column>
    <el-table-column label="排除规则">
      <template #default="scope">
        <p :class="{ red: scope.row.reason == 'rule' }">
          <template v-for="(rule, index) of scope.row.excludeRules as ExcludeRule[]" :key="index">
            {{ rule.startweek }}-{{ rule.endweek }}周/{{ dayOfWeeksC(rule.dayweeks!) }}/
            {{ periodOfDaysC(rule.periods!) }}
            <br />
          </template>
        </p>
      </template>
    </el-table-column>
  </el-table>
</template>
<style scoped>
.red {
  color: red;
  font-weight: bold;
}
</style>
