<script setup lang="ts">
import { listUsersService, updateUserInviStatusService } from '@/services/SubjectService'
import { useMessageStore } from '@/stores/MessageStore'
import type { User } from '@/types'

const users = await listUsersService()
//
const btnR = ref(true)

const userStatusR = ref<User[]>([])
users.forEach((us) => {
  userStatusR.value.push({ id: us.id, inviStatus: us.inviStatus, name: us.name })
})

//
const activeC = computed(() => (status: number) => status == 1)
const changeStatus = (user: User) => {
  btnR.value = false
  user.inviStatus = user.inviStatus == 1 ? 0 : 1
}

//
const updateUserInviStatus = () => {
  const users: User[] = []
  userStatusR.value.forEach((u) => {
    users.push({ id: u.id, inviStatus: u.inviStatus })
  })
  updateUserInviStatusService(users).then(() => {
    const { messageS } = storeToRefs(useMessageStore())
    messageS.value = '更新成功'
  })
  btnR.value = true
}
</script>
<template>
  <el-row class="my-row">
    <el-col style="margin-bottom: 5px" :span="22">
      <p>
        <el-tag>开启/关闭</el-tag>
        监考分配显示
      </p>
    </el-col>
    <el-col :span="2">
      <el-button type="success" @click="updateUserInviStatus" :disabled="btnR">提交</el-button>
    </el-col>
    <el-col style="margin-bottom: 5px">
      <template v-for="(user, index) of userStatusR" :key="index">
        <el-switch
          inline-prompt
          size="large"
          :inactive-text="user.name"
          :active-text="user.name"
          :model-value="activeC(user.inviStatus!)"
          @change="changeStatus(user)"
          style="margin-right: 5px" />
      </template>
    </el-col>
  </el-row>
</template>
