<script lang="ts" setup>
import { Lock } from '@element-plus/icons-vue'
import { useMessageStore } from '@/stores/MessageStore'
import { updateSelfPassword } from '@/services/CommonService'

const showPasswordR = ref(false)

const messageS = storeToRefs(useMessageStore()).messageS

const pwdM = ref({ p1: '', p2: '' })

const resetPwd = () => {
  if (!pwdM.value.p1 || !(pwdM.value.p1 == pwdM.value.p2)) {
    messageS.value = '2次输入密码不同'
    return
  }
  updateSelfPassword(pwdM.value.p1)
  pwdM.value.p2 = pwdM.value.p1 = ''

  showPasswordR.value = false
}
</script>
<template>
  <el-row class="my-row">
    <el-col :span="8" style="margin-bottom: 5px">
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
