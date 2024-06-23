<script setup lang="ts">
import {
  addUserService,
  getDingUserService,
  listDepartmentsService
} from '@/services/CollegeService'
import { ROLES, USER } from '@/services/Const'
import type { Department, User } from '@/types'
import { createElNotificationSuccess } from '@/components/message'
import { createElLoading } from '@/components/loading'
import { getSelfUserService } from '@/services/CommonService'

const departmentsR = ref<Department[]>([])
const userR = ref<User>({ role: USER })
const departR = ref<Department>()

const searchF = async () => {
  const loading = createElLoading()
  try {
    const dingUser = await getDingUserService(userR.value.mobile!)
    if (!dingUser?.userid || !dingUser.unionid) {
      throw '无法查询到钉钉用户'
    }
    userR.value.name = dingUser?.name
    userR.value.dingUserId = dingUser?.userid
    userR.value.dingUnionId = dingUser?.unionid
    departmentsR.value = await listDepartmentsService()
  } finally {
    loading.close()
  }
}

const submitF = async () => {
  const collUserR = getSelfUserService()
  userR.value.department = {
    collId: collUserR.department?.collId,
    collegeName: collUserR.department?.collegeName,
    depId: departR.value?.id,
    departmentName: departR.value?.name
  }
  if (
    !userR.value.dingUnionId ||
    !userR.value.dingUserId ||
    !userR.value.account ||
    !userR.value.department?.depId
  ) {
    throw '有必填项为空'
  }

  await addUserService(userR.value)
  userR.value = {}
  createElNotificationSuccess('添加成功')
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <p style="margin-bottom: 10px">手动添加教师，需输入用户钉钉注册手机号</p>
      <el-form :inline="true" v-if="!userR.dingUserId">
        <el-form-item>
          <el-input v-model="userR.mobile" placeholder="钉钉注册手机号"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="success" :disabled="userR.mobile?.length == 0" @click="searchF">
            提交
          </el-button>
        </el-form-item>
      </el-form>
      <!--  -->
      <el-form label-width="120px" style="width: 600px" v-if="userR.dingUserId">
        <el-form-item label="姓名">
          <el-input v-model="userR.name" />
        </el-form-item>
        <el-form-item label="工号">
          <el-input v-model="userR.account" />
        </el-form-item>
        <el-form-item label="钉钉userid">
          <el-input v-model="userR.dingUserId" readonly />
        </el-form-item>
        <el-form-item label="钉钉unionid">
          <el-input v-model="userR.dingUnionId" readonly />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="userR.mobile" />
        </el-form-item>
        <el-form-item label="部门">
          <el-select
            value-key="id"
            v-model="departR"
            placeholder="选择新部门"
            size="large"
            style="width: 200px; margin-right: 10px">
            <el-option
              v-for="(depart, index) of departmentsR"
              :key="index"
              :label="depart.name"
              :value="depart" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="userR.role"
            placeholder="选择角色"
            size="large"
            style="width: 200px; margin-right: 10px">
            <el-option
              v-for="(role, index) of ROLES"
              :key="index"
              :label="role.name"
              :value="role.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="submitF">提交</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>
