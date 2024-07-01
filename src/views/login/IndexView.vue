<script lang="ts" setup>
import { freePwdService, loginService } from '@/services/CommonService'
import { useUserStore } from '@/stores/UserStore'
import type { User } from '@/types'
import { Lock, User as UserIco, SwitchButton, Coffee, Delete } from '@element-plus/icons-vue'

onMounted(() => {
  let script = document.createElement('script')
  script.src = 'https://sdk.jinrishici.com/v2/browser/jinrishici.js'
  document.body.appendChild(script)
})
const userStore = useUserStore()
const userR = ref<User>({ account: '', password: '' })
const freeR = ref(false)

const localNameR = ref<string>()

const nameLocal = userStore.getLocalName()
const ltoken = userStore.getLKoken()
if (nameLocal && ltoken) {
  localNameR.value = nameLocal
}

const login = async () => {
  const account = userR.value.account
  const password = userR.value.password
  userR.value.account = ''
  userR.value.password = ''
  await loginService(
    {
      account: account,
      password: password
    },
    freeR.value
  )
}

const freeLoginF = async () => {
  await freePwdService()
}

const removeFreePwd = () => {
  localNameR.value = undefined
  localStorage.clear()
  sessionStorage.clear()
}
</script>

<template>
  <el-row v-if="localNameR">
    <el-col :span="12" :offset="6" style="margin-top: 15px">
      <el-card class="box-card">
        <el-tag effect="plain" size="large" style="margin-bottom: 10px">
          欢迎回来，{{ localNameR }}老师
        </el-tag>
        <br />
        <el-button type="success" @click="freeLoginF" style="margin-bottom: 10px">
          <el-icon style="margin-right: 8px"><Coffee /></el-icon>
          <span id="jinrishici-sentence" style="margin-left: 0"></span>
        </el-button>
        <br />
        <el-button type="danger" @click="removeFreePwd" style="margin-bottom: 10px">
          <el-icon style="margin-right: 8px"><Delete /></el-icon>
          移除免密登录令牌，重新登录
        </el-button>
      </el-card>
    </el-col>
  </el-row>

  <el-row v-if="!localNameR">
    <el-col :span="12" :offset="6" style="margin-top: 15px" @keyup.enter="login">
      <el-card class="box-card">
        <div style="margin-bottom: 10px">
          <el-input
            v-model="userR.account"
            placeholder="账号"
            :prefix-icon="UserIco"
            style="margin-bottom: 10px" />
          <el-input
            type="password"
            v-model="userR.password"
            placeholder="密码"
            :prefix-icon="Lock" />
          <el-checkbox v-model="freeR" label="获取免密登录令牌" size="large" />
        </div>

        <el-button type="primary" @click="login" :disabled="!userR.account || !userR.password">
          <el-icon><SwitchButton /></el-icon>
        </el-button>
      </el-card>
    </el-col>
  </el-row>
</template>
