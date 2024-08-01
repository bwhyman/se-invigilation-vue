<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import router from '@/router'
import { CollegeService } from '@/services/CollegeService'
import { COLLEGE_ADMIN, SUBJECT_ADMIN } from '@/services/Const'
import { SubjectService } from '@/services/SubjectService'
import { useSettingStore } from '@/stores/SettingStore'
import type { User } from '@/types'
import { getFinalNotice, getInitNotice } from './AssignNotice'

const params = useRoute().params as { inviid: string }
const role = sessionStorage.getItem('role')
let getInvi
if (role == COLLEGE_ADMIN) {
  getInvi = CollegeService.getCollegeInviService(params.inviid)
} else if (role == SUBJECT_ADMIN) {
  getInvi = SubjectService.getInviService(params.inviid)
}

const results = await Promise.all([
  SubjectService.listInviDetailUsersService(params.inviid),
  getInvi
])

const assigners = results[0]
const invigilationR = results[1]
const settingsStore = useSettingStore()

const selectUsersR = ref<User[]>([...assigners])
if (!invigilationR || !invigilationR.value) {
  throw `监考信息读取错误`
}

const notice = getInitNotice(assigners, invigilationR.value, settingsStore.getFirstWeek())

const dingUsers: User[] = []
const noDingUsers: User[] = []

for (const us of assigners) {
  us.dingUserId ? dingUsers.push(us) : noDingUsers.push(us)
}

const noticeAssignersF = async () => {
  if (invigilationR.value?.calendarId != null) {
    throw `请勿重复发送通知。如需更改请返回分配页面重新分配监考`
  }
  const noticeFinal = getFinalNotice(notice, selectUsersR.value)
  const msg = await SubjectService.noticeUsersService(noticeFinal)
  //
  const role = sessionStorage.getItem('role')
  if (role == SUBJECT_ADMIN) {
    router.push('/subject/dispatched')
  }
  if (role == COLLEGE_ADMIN) {
    router.push('/college/imported')
  }
  msg && createElNotificationSuccess(`通知发送成功。编号：${msg}`)
}
</script>
<template>
  <el-row class="my-row">
    <el-col>{{ notice.noticeMessage }}</el-col>
  </el-row>
  <el-row class="my-row">
    <el-col>
      分配结果已保存。
      <br />
      钉钉通知并添加到用户日程？
    </el-col>
    <el-col>
      <el-checkbox-group v-model="selectUsersR">
        <el-checkbox v-for="(user, index) of dingUsers" :key="index" :value="user" size="large">
          {{ user.name }}
          <el-tag type="danger" v-if="!user.dingUserId">该用户没有钉钉信息无法发送通过</el-tag>
        </el-checkbox>
      </el-checkbox-group>
    </el-col>
    <el-col>
      <el-tag type="danger" v-if="noDingUsers.length > 0" size="large" style="margin-bottom: 10px">
        以下用户没有钉钉信息无法向其发送通过
      </el-tag>
      <br />
      <el-tag v-for="(user, index) of noDingUsers" :key="index" size="large">
        {{ user.name }}
      </el-tag>
    </el-col>
    <el-col>
      <el-button
        v-if="!(dingUsers.length == 0)"
        type="success"
        @click="noticeAssignersF"
        :disabled="dingUsers.length == 0"
        style="margin-right: 10px">
        提交
      </el-button>
      <el-tag type="danger" v-if="dingUsers.length == 0" size="large">
        所用用户均没有钉钉信息，无法提交发送通知请求
      </el-tag>
    </el-col>
  </el-row>
</template>
