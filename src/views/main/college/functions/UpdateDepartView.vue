<script setup lang="ts">
import { createMessageDialog } from '@/components/message'
import {
  getUserService,
  listDepartmentsService,
  updateUserDepartmentService
} from '@/services/CollegeService'
import { useUserStore } from '@/stores/UserStore'
import type { Department, User, UserDepartment } from '@/types'

const userR = ref<User>()
const accountR = ref('')
const departmentR = ref('')
const userStore = useUserStore()
const departmentsR = ref<Department[]>([])

const searchF = async () => {
  if (accountR.value.length == 0) return
  const results = await Promise.all([getUserService(accountR.value), listDepartmentsService()])
  const u = results[0]
  departmentsR.value = results[1]
  if (!u) {
    createMessageDialog('指定工号的教师不存在')
    return
  }
  userR.value = u
}

const update = () => {
  const depart = departmentsR.value.find((d) => d.id == departmentR.value)
  if (!depart) {
    createMessageDialog('选择部门错误')
    return
  }
  const dep: UserDepartment = {
    collId: userStore.userS.department?.collId,
    collegeName: userStore.userS.department?.collegeName,
    depId: depart.id,
    departmentName: depart.name
  }
  const user: User = { id: userR.value?.id, department: dep }
  updateUserDepartmentService(user).then(() => {
    createMessageDialog('部门更新成功')
    userR.value = undefined
    accountR.value = ''
    departmentR.value = ''
  })
}
</script>
<template>
  <el-row class="my-row">
    <el-col>基于工号查询教师，更新教师所在部门</el-col>
    <el-col :span="8">
      <el-form :inline="true">
        <el-form-item>
          <el-input v-model="accountR" placeholder="教师工号"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="success" :disabled="accountR.length == 0" @click="searchF">
            提交
          </el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-col :span="16" v-if="userR">
      {{ userR?.name }} / {{ userR?.department?.departmentName }}

      <el-select
        v-model="departmentR"
        placeholder="选择新部门"
        size="large"
        style="width: 200px; margin-right: 10px">
        <el-option
          v-for="(depart, index) of departmentsR"
          :key="index"
          :label="depart.name"
          :value="depart.id" />
      </el-select>
      <el-button type="success" :disabled="!departmentR" @click="update">提交</el-button>
    </el-col>
  </el-row>
</template>
