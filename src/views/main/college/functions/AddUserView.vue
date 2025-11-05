<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import { CommonService } from '@/services/CommonService'
import { ROLES } from '@/services/Const'
import type { Department, User } from '@/types'

const enabledR = ref(false)
const { data: departmentsR } = CollegeService.listDepartmentsService(enabledR)
const userR = ref<User>({})
const departR = ref<Department>()

//
const { data: dingUserR, suspense: s2 } = CollegeService.getDingUserService(
  computed(() => userR.value.mobile),
  enabledR
)
const searchF = async () => {
  enabledR.value = true
  await s2()
  const dingU = toRaw(dingUserR.value)
  if (!dingU) {
    enabledR.value = false
    userR.value = {}
    throw '无法查询到钉钉用户'
  }
  userR.value.name = dingU.name
  userR.value.dingUserId = dingU.userid
  userR.value.dingUnionId = dingU.unionid
}

//
const { data: collUserR, suspense: s1 } = CommonService.getUserInfoService()
await s1()
const { mutateAsync: mutAddUser } = CollegeService.addUserService()
const submitF = async () => {
  if (!collUserR.value) return
  userR.value.department = {
    collId: collUserR.value.department?.collId,
    collegeName: collUserR.value.department?.collegeName,
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
  //
  await mutAddUser(userR.value)
  userR.value = {}
  createElNotificationSuccess('添加成功')
}
const submitC = computed(
  () =>
    userR.value.name &&
    userR.value.account &&
    userR.value.mobile &&
    departR.value?.id &&
    userR.value.role
)
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <p style="margin-bottom: 10px">基于钉钉注册手机号查询用户</p>
      <el-form :inline="true">
        <el-form-item>
          <el-input v-model="userR.mobile" placeholder="钉钉注册手机号"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="success" :disabled="userR.mobile?.length == 0" @click="searchF">
            查询
          </el-button>
        </el-form-item>
      </el-form>
      <!--  -->
      <p style="margin-bottom: 10px">
        手动录入用户。没有钉钉数据无法发送钉钉消息，但不影响监考数据记录
      </p>
      <el-form label-width="120px" style="width: 600px">
        <el-form-item label="*姓名">
          <el-input v-model="userR.name" />
        </el-form-item>
        <el-form-item label="*帐号">
          <el-input v-model="userR.account" />
        </el-form-item>
        <el-form-item label="钉钉userid">
          <el-input v-model="userR.dingUserId" disabled />
        </el-form-item>
        <el-form-item label="钉钉unionid">
          <el-input v-model="userR.dingUnionId" disabled />
        </el-form-item>
        <el-form-item label="*手机号">
          <el-input v-model="userR.mobile" />
        </el-form-item>
        <el-form-item label="*部门">
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
          <el-button type="success" @click="submitF" :disabled="!submitC">提交</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>
