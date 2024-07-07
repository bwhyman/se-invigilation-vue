<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import { ROLES } from '@/services/Const'
import type { User } from '@/types'
import DepartmentUser from './finduser/DepartmentUser.vue'

const exposeR = ref<{ selectUser: User; clear: Function }>()
const roleR = ref('')

const update = async () => {
  const u: User = {}
  u.id = exposeR.value?.selectUser.id
  u.role = roleR.value
  await CollegeService.updateUserRoleService(u)

  createElNotificationSuccess('角色更新成功')
  exposeR.value?.clear()
  exposeR.value!.selectUser! = {}
}
</script>
<template>
  <el-row class="my-row" style="align-items: flex-end">
    <el-col :span="12">
      <DepartmentUser ref="exposeR" />
    </el-col>
    <el-col :span="12" v-if="exposeR?.selectUser.id">
      <el-select
        v-model="roleR"
        placeholder="选择角色"
        size="large"
        style="width: 200px; margin-right: 10px">
        <el-option
          v-for="(role, index) of ROLES"
          :key="index"
          :label="role.name"
          :value="role.value" />
      </el-select>
      <el-button type="success" :disabled="!roleR" @click="update">提交</el-button>
    </el-col>
  </el-row>
</template>
