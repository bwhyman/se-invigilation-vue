<script lang="ts" setup>
import { createElNotificationSuccess } from '@/components/message'
import { CommonService } from '@/services/CommonService'
import { Lock } from '@element-plus/icons-vue'

const showPasswordR = ref(false)
const pwdM = ref({ p1: '', p2: '' })

const resetPwd = async () => {
  if (!pwdM.value.p1 || !(pwdM.value.p1 == pwdM.value.p2)) {
    throw '2次输入密码不同'
  }
  await CommonService.updateSelfPassword(pwdM.value.p1)
  createElNotificationSuccess('密码更新成功')
  pwdM.value.p2 = pwdM.value.p1 = ''

  showPasswordR.value = false
}
</script>
<template>
  <el-row class="my-row">
    <el-col :span="8">
      <el-input
        type="password"
        v-model="pwdM.p1"
        placeholder="password"
        :prefix-icon="Lock"
        style="margin-bottom: 10px" />
      <el-input type="password" v-model="pwdM.p2" placeholder="re-enter" :prefix-icon="Lock" />
    </el-col>
    <el-col>
      <el-button type="primary" @click="resetPwd" :disabled="!pwdM.p2 || !pwdM.p1">Reset</el-button>
    </el-col>
  </el-row>
</template>
