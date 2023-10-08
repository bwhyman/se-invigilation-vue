<script setup lang="ts">
import {
  addTimetableService,
  addTimetablesService,
  listCollegeUsersService,
  getUserService
} from '@/services/CollegeService'
import { readCollegeTimetableExcel, readTimetableExcel } from '@/services/ExcelUtils'
import { useMessageStore } from '@/stores/MessageStore'
import type { ImportTimetable, Timetable, User } from '@/types'

const users: User[] = []
const messageStore = useMessageStore()
const timetables: Timetable[] = []
const importTimetablesR = ref<ImportTimetable[]>([])

const readTimetables = async (event: Event) => {
  const element = event.target as HTMLInputElement
  if (!element || !element.files) {
    return
  }

  const results = await Promise.all([
    listCollegeUsersService(),
    readCollegeTimetableExcel(element.files[0])
  ])

  users.push(...results[0])
  importTimetablesR.value = results[1]

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
  element.value = ''
}

const addTimetables = () => {
  importTimetablesR.value = []
  addTimetablesService(timetables).then(() => {
    importTimetablesR.value = []
    const { messageS } = storeToRefs(messageStore)
    messageS.value = '导入完成'
  })
}

const timetableUserAccountR = ref('')

//
const readSingleTimetable = async (event: Event) => {
  const element = event.target as HTMLInputElement
  if (!element || !element.files) {
    return
  }

  importTimetablesR.value = await readTimetableExcel(element.files[0])
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

  element.value = ''
}

const addTimetable = async () => {
  const user = await getUserService(timetableUserAccountR.value)
  if (!user) {
    storeToRefs(useMessageStore()).messageS.value = '未找到教师，请确定工号正确'
    return
  }
  if (!user.department?.depId) {
    storeToRefs(useMessageStore()).messageS.value = '教师没有部门，无法提交'
    return
  }
  //
  timetables.length = 0
  importTimetablesR.value.forEach((tb) => {
    tb.courses.forEach((tb2) => {
      tb2.userId = user.id
      tb2.depId = user.department?.depId
      timetables.push(tb2)
    })
  })
  importTimetablesR.value = []

  addTimetableService(timetableUserAccountR.value, timetables).then(() => {
    storeToRefs(useMessageStore()).messageS.value = '课表导入成功'
  })
}
</script>
<template>
  <el-row class="my-row">
    读取学院教师课表
    <el-col>
      <input type="file" @change="readTimetables" style="margin-right: 10px" />
      <el-button
        type="success"
        @click="addTimetables"
        :disabled="importTimetablesR.length == 0"
        style="vertical-align: middle">
        提交
      </el-button>
    </el-col>
  </el-row>
  <el-row class="my-row">
    <el-col>
      删除原课表，导入指定教师课表
      <br />
      <el-input
        style="width: 200px; margin-right: 10px"
        v-model="timetableUserAccountR"
        placeholder="教师工号" />
      <el-button
        type="success"
        @click="addTimetable"
        :disabled="importTimetablesR.length == 0 || timetableUserAccountR.length == 0"
        style="margin-bottom: 10px">
        提交
      </el-button>
      <br />
      <input type="file" @change="readSingleTimetable" />
    </el-col>
  </el-row>
  <el-row class="my-row" v-if="importTimetablesR.length > 0">
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
