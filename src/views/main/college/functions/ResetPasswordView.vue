<script setup lang="ts">
import { getUserService, resetPasswordService } from '@/services/CollegeService'
import { useMessageStore } from '@/stores/MessageStore'
import type { User } from '@/types'

const accountR = ref('')
const userR = ref<User>()
const messageStore = useMessageStore()

const checkUserF = async () => {
  const user = await getUserService(accountR.value)
  if (!user) {
    storeToRefs(messageStore).messageS.value = '未找到教师，请确定工号正确'
    return
  }
  userR.value = user
}

const changeF = () => {
  resetPasswordService(accountR.value).then(() => {
    storeToRefs(messageStore).messageS.value = '重置成功'
  })
}
</script>
<template>
  <el-row class="my-row">
    <el-col>基于工号查询教师，重置密码</el-col>
    <el-col :span="8">
      <el-input
        style="width: 200px; margin-right: 10px"
        v-model="accountR"
        placeholder="教师工号" />
      <el-button
        type="success"
        @click="checkUserF"
        :disabled="accountR.length == 0"
        style="margin-bottom: 10px">
        提交
      </el-button>
    </el-col>
    <el-col :span="16" v-if="userR">
      {{ userR.name }} / {{ userR.department?.departmentName }}
      <el-button
        type="success"
        @click="changeF"
        :disabled="accountR.length == 0"
        style="margin-bottom: 10px">
        重置账号密码为工号
      </el-button>
    </el-col>
  </el-row>
</template>
