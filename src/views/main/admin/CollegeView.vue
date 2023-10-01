<script setup lang="ts">
import { readCollegeTimetableExcel, readDingtalkExcel, readUsersExcel } from '@/services/ExcelUtils'
import {
  addCollegeService,
  addDingUsersService,
  addUsersService,
  listCollegesService
} from '@/services/AdminService'
import type { Department, User } from '@/types'
import { Check } from '@element-plus/icons-vue'

const collegeNameR = ref('')
const collegesR = ref<Department[]>([])
const selectCollegeR = ref<Department>()
const usersR = ref<User[]>([])

listCollegesService().then((colleges) => {
  collegesR.value = colleges
})

const addCollegeF = () => {
  addCollegeService(collegeNameR.value)
  collegeNameR.value = ''
}

const readTimetables = (event: Event) => {
  const element = event.target as HTMLInputElement
  if (!element || !element.files) {
    return
  }
  readCollegeTimetableExcel(element.files[0]).then((teachers) => {
    console.log(teachers)
    usersR.value = teachers
  })
}
//
const readUsers = (event: Event) => {
  const element = event.target as HTMLInputElement
  if (!element || !element.files) {
    return
  }
  readUsersExcel(element.files[0]).then((users) => {
    console.log(users)
    usersR.value = users
  })
}

const addUsersF = () => {
  if (!selectCollegeR.value?.id || !selectCollegeR.value?.name || usersR.value?.length == 0) return
  addUsersService({
    collId: selectCollegeR.value?.id,
    collegeName: selectCollegeR.value?.name,
    users: usersR.value
  })
}

let dingUsers: User[] = []

//
const readDingUsers = (event: Event) => {
  const element = event.target as HTMLInputElement
  if (!element || !element.files) {
    return
  }
  readDingtalkExcel(element.files[0]).then((users) => {
    console.log(users)
    dingUsers = users
  })
}

const addDingUsers = () => {
  addDingUsersService(dingUsers)
}
</script>
<template>
  <el-form :inline="true">
    <el-form-item>
      <el-input v-model="collegeNameR" placeholder="添加学院名称"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button
        type="success"
        :icon="Check"
        @click="addCollegeF"
        :disabled="collegeNameR.length == 0"></el-button>
    </el-form-item>
  </el-form>
  <el-form :inline="true">
    <el-form-item>
      <el-select v-model="selectCollegeR" class="m-2" placeholder="Select" size="large">
        <el-option
          v-for="(coll, index) of collegesR"
          :key="index"
          :label="coll.name"
          :value="{ id: coll.id, name: coll.name }" />
      </el-select>
    </el-form-item>
    <el-form-item>
      <input type="file" @change="readTimetables" />
    </el-form-item>
  </el-form>
  导入用户
  <el-form :inline="true">
    <el-form-item>
      <input type="file" @change="readUsers" />
      <el-button type="success" :icon="Check" @click="addUsersF"></el-button>
    </el-form-item>
  </el-form>
  导入钉钉表格
  <el-form :inline="true">
    <el-form-item>
      <input type="file" @change="readDingUsers" />
      <el-button type="success" :icon="Check" @click="addDingUsers"></el-button>
    </el-form-item>
  </el-form>
</template>
