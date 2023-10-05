<script lang="ts" setup>
import { loginService } from '@/services/CommonService'
import type { User } from '@/types'
import { Lock, User as UserIco, SwitchButton } from '@element-plus/icons-vue'

const user = ref<User>({})

let login = () => {
  let account = user.value.account
  let password = user.value.password

  loginService({
    account: account,
    password: password
  })
  user.value.account = ''
  user.value.password = ''
}
</script>

<template>
  <el-row>
    <el-col :span="12" :offset="6" style="margin-top: 15px" @keyup.enter="login">
      <el-card class="box-card">
        <div style="margin-bottom: 15px">
          <el-input
            v-model="user.account"
            placeholder="账号"
            :prefix-icon="UserIco"
            style="margin-bottom: 10px" />
          <el-input
            type="password"
            v-model="user.password"
            placeholder="密码"
            :prefix-icon="Lock" />
        </div>
        <el-button type="primary" @click="login" :disabled="!user.account || !user.password">
          <el-icon><SwitchButton /></el-icon>
        </el-button>
      </el-card>
    </el-col>
  </el-row>
</template>
