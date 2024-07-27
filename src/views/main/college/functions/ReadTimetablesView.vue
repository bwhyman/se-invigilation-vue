<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import type { ImportTimetable, Timetable, User } from '@/types'
import DepartmentUser from './finduser/DepartmentUser.vue'

const users: User[] = []
const timetables: Timetable[] = []
const importTimetablesR = ref<ImportTimetable[]>([])
const sameNameR = ref(false)

const readTimetables = async (event: Event) => {
  const element = event.target as HTMLInputElement
  if (!element || !element.files) {
    return
  }

  const { readTimetableExcel, readPostGTimetableExcel } = await import(
    '@/services/excel/TimetableExcel'
  )
  try {
    const results = await Promise.all([
      CollegeService.listCollegeUsersService(),
      readTimetableExcel(element.files[0]),
      readPostGTimetableExcel(element.files[0])
    ])

    users.push(...results[0].value)
    importTimetablesR.value = results[1]
    importTimetablesR.value.push(...results[2])
  } finally {
    element.value = ''
  }
  console.log(importTimetablesR.value)
}

const addTimetables = async () => {
  const importTimes = importTimetablesR.value.filter((tb) => tb.courses.length != 0)
  users.forEach((user) => {
    const temp = importTimes.filter((tb) => tb.name == user.name)
    temp.forEach((t) => {
      t.courses.forEach((t) => {
        t.userId = user?.id
        timetables.push(t)
      })
    })
  })
  importTimetablesR.value = []
  await CollegeService.addTimetablesService(timetables)
  importTimetablesR.value = []
  createElNotificationSuccess('导入完成')
}

const exposeR = ref<{ selectUser: User; clear: Function }>()
//
const readSingleTimetable = async (event: Event) => {
  const element = event.target as HTMLInputElement
  if (!element || !element.files) {
    return
  }
  const { readTimetableExcel } = await import('@/services/excel/TimetableExcel')
  importTimetablesR.value = await readTimetableExcel(element.files[0], false)
  element.value = ''
}

const addTimetable = async () => {
  if (!exposeR.value?.selectUser.id) {
    throw '选择教师失败'
  }
  //
  timetables.length = 0
  importTimetablesR.value.forEach((tb) => {
    tb.courses.forEach((tb2) => {
      tb2.userId = exposeR.value?.selectUser?.id
      timetables.push(tb2)
    })
  })
  importTimetablesR.value = []

  await CollegeService.addTimetableService(exposeR.value?.selectUser?.id!, timetables)
  createElNotificationSuccess('课表导入成功')
  exposeR.value?.clear()
  exposeR.value!.selectUser! = {}
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      读取全院教师课表。
      <br />
      将研究生课表(与正常课表相似的按星期/节排列的版本)，复制到全院课表表格的第2个sheet，自动全部读取。
      <br />
      提交时自动删除原全部课表。
      <br />
      请将同名教师姓名，改为钉钉群中名称。例如，电气李丹
      <br />
      <el-checkbox
        v-model="sameNameR"
        label="确认，已修改课表中的同名教师姓名与系统姓名一致"
        size="large"
        style="color: red; font-weight: bold"
        border />
    </el-col>
    <el-col>
      <hr />
    </el-col>
    <el-col>
      <input type="file" @change="readTimetables" style="margin-right: 10px" />
      <el-button
        type="success"
        @click="addTimetables"
        :disabled="importTimetablesR.length == 0 || !sameNameR"
        style="vertical-align: middle">
        提交
      </el-button>
    </el-col>
    <el-col>
      <hr />
    </el-col>
    <el-col>
      <p>删除原课表，导入指定教师课表</p>
    </el-col>
    <el-col :span="12">
      <DepartmentUser ref="exposeR" />
    </el-col>
    <el-col :span="12" v-if="exposeR?.selectUser.account">
      <input type="file" @change="readSingleTimetable" />
      <el-button
        type="success"
        @click="addTimetable"
        v-if="importTimetablesR.length > 0 || !sameNameR"
        style="margin-bottom: 10px">
        提交
      </el-button>
    </el-col>
    <el-col v-if="importTimetablesR.length > 0">
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
    </el-col>
  </el-row>
</template>
