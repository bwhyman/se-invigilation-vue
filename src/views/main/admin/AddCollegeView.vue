<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { AdminService } from '@/services/AdminService'
import type { Department } from '@/types'

const collegeR = ref<Department>({})
const addCollegeF = async () => {
  await AdminService.addCollegeService(collegeR.value)
  createElNotificationSuccess('添加成功')
  collegeR.value = {}
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <el-form :inline="true">
        <el-form-item>
          <el-input v-model="collegeR.name" placeholder="学院"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="collegeR.dingDepid" placeholder="钉钉号"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="success"
            :disabled="!collegeR.dingDepid || collegeR.dingDepid.length == 0"
            @click="addCollegeF">
            提交
          </el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>
