<script setup lang="ts">
import { createMessageDialog } from '@/components/message'
import { resetPasswordService } from '@/services/CollegeService'
import type { User } from '@/types'
import DepartmentUser from './finduser/DepartmentUser.vue'

const exposeR = ref<{ selectUser: User; clear: Function }>()

const changeF = async () => {
  await resetPasswordService(exposeR.value?.selectUser.account!)
  createMessageDialog('密码重置成功')
  exposeR.value?.clear()
  exposeR.value!.selectUser! = {}
}
</script>
<template>
  <el-row class="my-row" style="align-items: flex-end">
    <el-col :span="12">
      <DepartmentUser ref="exposeR" />
    </el-col>
    <el-col :span="12" v-if="exposeR?.selectUser.id" style="margin-bottom: 5px">
      <el-button type="success" @click="changeF" :disabled="!exposeR?.selectUser">
        重置账号密码为工号
      </el-button>
    </el-col>
  </el-row>
</template>
