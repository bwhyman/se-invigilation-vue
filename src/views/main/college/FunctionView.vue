<script setup lang="ts">
import { addTimetablesService, getCollegeUsersService } from '@/services/CollegeService'
import { readCollegeTimetableExcel, readDingtalkExcel } from '@/services/ExcelUtils'
import type { ImportTimetable, Timetable } from '@/types'

const users = (await getCollegeUsersService()) ?? []

const timetables: Timetable[] = []
const userUnkowns = ref<string[]>([])

const importTimetablesR = ref<ImportTimetable[]>([])

const readTimetables = (event: Event) => {
  const element = event.target as HTMLInputElement
  if (!element || !element.files) {
    return
  }
  readCollegeTimetableExcel(element.files[0]).then((tbs) => {
    importTimetablesR.value = tbs
    const importTimes = importTimetablesR.value.filter((tb) => tb.courses.length != 0)
    users.forEach((user) => {
      const temp = importTimes.filter((tb) => tb.name == user.name)
      temp.forEach((t) => {
        t.courses.forEach((t) => {
          t.depId = user?.department?.depId
          t.userId = user?.id
          timetables.push(t)
        })
      })
    })
  })
}

const addTimetables = () => {
  let temp = JSON.stringify(timetables)
  let x = JSON.parse(temp) as Timetable[]
  addTimetablesService(x).then((result) => (importTimetablesR.value = []))
}

//
const readDingUsers = (event: Event) => {
  const element = event.target as HTMLInputElement
  if (!element || !element.files) {
    return
  }

  readDingtalkExcel(element.files[0]).then((dingUsers) => {
    users.forEach((u) => {
      const x = dingUsers.find((du) => du.mobile == u.mobile)
      if (!x) {
        console.log(u.name)
      }
    })
  })
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      读取Dingtalk用户表格
      <input type="file" @change="readDingUsers" />
    </el-col>
  </el-row>
  <el-row class="my-row">
    读取学院教师课表
    <el-col>
      <input type="file" @change="readTimetables" />
    </el-col>
  </el-row>
  <el-row class="my-row" v-if="importTimetablesR.length > 0">
    <el-col style="margin-bottom: 10px; text-align: right">
      <el-button
        type="primary"
        @click="addTimetables"
        :disabled="importTimetablesR.length == 0"
        style="vertical-align: middle">
        提交
      </el-button>
    </el-col>
    <el-col>
      <span v-for="(name, index) of userUnkowns" :key="index">{{ name }};</span>
    </el-col>
    <el-table :data="importTimetablesR">
      <el-table-column type="index" label="#" width="50" />
      <el-table-column min-width="10">
        <template #default="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column>
        <template #default="scope">
          <template v-for="(course, index) of scope.row.courses" :key="index">
            {{ course.startweek }} - {{ course.endweek }}周 / 星期{{ course.dayweek }} /
            {{ course.period }}节; {{ course.course.courseName }} / {{ course.course.clazz }} /
            {{ course.course.location }}
            <br />
          </template>
        </template>
      </el-table-column>
    </el-table>
  </el-row>
</template>
