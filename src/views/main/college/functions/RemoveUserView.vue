<script setup lang="ts">
import type { User } from '@/types'
import DepartmentUser from './finduser/DepartmentUser.vue'
import { removeUserService } from '@/services/CollegeService'
import { createElNotificationSuccess } from '@/components/message'

const exposeR = ref<{ selectUser: User; clear: Function }>()

const removeF = () => {
  if (!exposeR.value?.selectUser.id) {
    throw '用户为空，请选择用户'
  }
  ElMessageBox.confirm(`移除用户 ${exposeR.value?.selectUser.name}，确定移除？`, 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  }).then(async () => {
    exposeR.value?.selectUser.id && (await removeUserService(exposeR.value?.selectUser.id))
    createElNotificationSuccess('用户移除成功')
    exposeR.value?.clear()
    exposeR.value!.selectUser! = {}
  })
}
</script>
<template>
  <el-row class="my-row" style="align-items: flex-end">
    <el-col :span="12">
      <DepartmentUser ref="exposeR" />
    </el-col>
    <el-col :span="12" v-if="exposeR?.selectUser.id" style="margin-bottom: 5px">
      <el-button type="success" @click="removeF" :disabled="!exposeR?.selectUser">
        移除用户： {{ exposeR.selectUser.name }} / {{ exposeR.selectUser.account }}
      </el-button>
    </el-col>
  </el-row>
</template>
