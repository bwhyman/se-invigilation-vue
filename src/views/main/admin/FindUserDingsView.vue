<script setup lang="ts">
import { CollegeService } from '@/services/CollegeService';
import type { User } from '@/types';

const userR = ref<User>({})

const searchF = async () => {
  const dingUser = await CollegeService.getDingUserService(userR.value.mobile!)
  userR.value.name = dingUser?.name
  userR.value.dingUserId = dingUser?.userid
  userR.value.dingUnionId = dingUser?.unionid
}
</script>
<template>
  <el-row class="my-row">
    <el-col>查询用户钉钉信息</el-col>
    <el-col>
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
        <el-form-item label="*姓名">
          <el-input v-model="userR.name" />
        </el-form-item>
        <el-form-item label="*工号">
          <el-input v-model="userR.account" />
        </el-form-item>
        <el-form-item label="钉钉userid">
          <el-input v-model="userR.dingUserId" disabled />
        </el-form-item>
        <el-form-item label="钉钉unionid">
          <el-input v-model="userR.dingUnionId" disabled />
        </el-form-item>
        <el-form-item label="*手机号">
          <el-input v-model="userR.mobile" disabled />
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>
