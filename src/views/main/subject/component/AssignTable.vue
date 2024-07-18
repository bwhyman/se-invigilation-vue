<script setup lang="ts">
import { dayOfWeeksC, periodOfDaysC } from '@/services/ExcludeRule'
import type { ExcludeRule, InviAssignUser, Invigilation, Timetable } from '@/types'

const props = defineProps<{
  users: InviAssignUser[]
  dayweek: string
  hasRules: boolean
  selectedUsers: InviAssignUser[]
  amount: number
}>()
const amount = props.amount
const selectedUsers = props.selectedUsers

const assignPlusF = (user: InviAssignUser) => {
  if (selectedUsers.length < amount) {
    selectedUsers.push(user)
    return
  }
}

const assignMinusF = (user: InviAssignUser) => {
  if (selectedUsers.length == 0) return
  const index = selectedUsers.indexOf(user)
  selectedUsers.splice(index, 1)
}
</script>
<template>
  <el-table :data="props.users">
    <el-table-column type="index" label="" width="50" />
    <el-table-column width="220">
      <template #default="scope">
        <el-button class="button-cal button-minus" @click="assignMinusF(scope.row)">-</el-button>
        <el-tag style="margin-left: 2px">{{ scope.row.amount }}</el-tag>
        <span class="name">
          {{ scope.row.name }}
        </span>
        <el-button
          class="button-cal"
          :type="scope.row.plusButton.type"
          @click="assignPlusF(scope.row)"
          :disabled="scope.row.plusButton.disPlus">
          {{ scope.row.plusButton.plusContent }}
        </el-button>
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
    <el-table-column label="当日监考">
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
    <el-table-column label="排除规则" v-if="props.hasRules">
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

.name {
  margin: 5px;
  display: inline-block;
  min-width: 60px;
  text-align: justify;
  text-align-last: justify;
}

.button-cal {
  min-width: 40px;
}
.button-minus:focus:not(.button-minus:hover) {
  background-color: white;
}
</style>
