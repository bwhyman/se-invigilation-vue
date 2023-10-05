<script setup lang="ts">
import {
  addTimetableService,
  addTimetablesService,
  getCollegeUsersService,
  listDepartmentsService,
  updateDepartmentInviStatus
} from '@/services/CollegeService'
import {
  readCollegeTimetableExcel,
  readDingtalkExcel,
  readTimetableExcel
} from '@/services/ExcelUtils'
import { useMessageStore } from '@/stores/MessageStore'
import type { Department, ImportTimetable, Timetable, User } from '@/types'

const users: User[] = []
//const users = (await getCollegeUsersService()) ?? []
let departments = await listDepartmentsService()

const departmentR = ref(departments)

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
  importTimetablesR.value = []
  addTimetablesService(timetables).then((result) => (importTimetablesR.value = []))
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

const timetableUserId = ref('')

//
const readSingleTimetable = (event: Event) => {
  const element = event.target as HTMLInputElement
  if (!element || !element.files) {
    return
  }
  readTimetableExcel(element.files[0]).then((tbs) => {
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

const addTimetable = () => {
  const user = users.find((u) => u.account == timetableUserId.value)
  if (!user) {
    storeToRefs(useMessageStore()).messageS.value = '未找到教师，请确定工号正确'
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

  addTimetableService(timetableUserId.value, timetables).then(() => {
    storeToRefs(useMessageStore()).messageS.value = '课表导入成功'
  })
}

// 更新专业监考下发显示
const btnR = ref(true)
const activeC = computed(() => (status: number) => status == 1)

const changeStatus = (depart: Department) => {
  btnR.value = false
  depart.inviStatus = depart.inviStatus == 1 ? 0 : 1
}
const updateUserInviStatus = () => {
  const deps: Department[] = []
  departmentR.value.forEach((e) => {
    deps.push({ id: e.id, inviStatus: e.inviStatus })
  })

  updateDepartmentInviStatus(deps).then((departs) => {
    departmentR.value = departs
    storeToRefs(useMessageStore()).messageS.value = '更新成功'
  })
}
</script>
<template>
  <el-row class="my-row">
    <el-col style="margin-bottom: 5px" :span="22">
      <p>
        <el-tag>开启/关闭</el-tag>
        监考分配显示
      </p>
    </el-col>
    <el-col :span="2">
      <el-button type="success" @click="updateUserInviStatus" :disabled="btnR">提交</el-button>
    </el-col>
    <el-col style="margin-bottom: 5px">
      <template v-for="(depart, index) of departmentR" :key="index">
        <el-switch
          inline-prompt
          size="large"
          :inactive-text="depart.name"
          :active-text="depart.name"
          :model-value="activeC(depart.inviStatus!)"
          @change="changeStatus(depart)"
          style="margin-right: 5px" />
      </template>
    </el-col>
    <el-col></el-col>
  </el-row>
  <el-row class="my-row">
    <el-col>
      读取Dingtalk用户表格
      <input type="file" @change="readDingUsers" />
    </el-col>
  </el-row>
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
        v-model="timetableUserId"
        placeholder="教师工号" />
      <el-button
        type="success"
        @click="addTimetable"
        :disabled="importTimetablesR.length == 0 || timetableUserId.length == 0"
        style="margin-bottom: 10px">
        提交
      </el-button>
      <br />
      <input type="file" @change="readSingleTimetable" />
    </el-col>
  </el-row>
  <el-row class="my-row" v-if="importTimetablesR.length > 0">
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
