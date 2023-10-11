<script setup lang="ts">
import { getUserService, updateUserRoleService } from '@/services/CollegeService'
import { ROLES } from '@/services/Const'
import { useMessageStore } from '@/stores/MessageStore'
import type { User } from '@/types'

const userR = ref<User>()
const accountR = ref('')
const roleR = ref('')
const messageStore = useMessageStore()

const searchF = async () => {
  if (accountR.value.length == 0) return
  const u = await getUserService(accountR.value)
  if (!u) {
    storeToRefs(messageStore).messageS.value = '指定工号的教师不存在'
    return
  }
  userR.value = u
}

const update = () => {
  const u: User = {}
  u.id = userR.value?.id
  u.role = roleR.value
  updateUserRoleService(u).then(() => {
    storeToRefs(messageStore).messageS.value = '角色更新成功'
    userR.value = undefined
    accountR.value = ''
  })
}
</script>
<template>
  <el-row class="my-row">
    <el-col>基于工号查询教师，修改教师角色</el-col>
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
