<script setup lang="ts">
import { getSettingsService } from '@/services/CommonService'
import {
  getInviService,
  listInviDetailUsersService,
  noticeUsersService
} from '@/services/SubjectService'
import { getInviChineseDayweek, getInviWeek } from '@/services/Utils'
import { useSettingStore } from '@/stores/SettingStore'
import type { Invigilation, Notice, User } from '@/types'
import { SUBJECT_ADMIN, COLLEGE_ADMIN } from '@/services/Const'
import router from '@/router'
import { getCollegeInviService } from '@/services/CollegeService'
import { createElNotificationSuccess, createMessageDialog } from '@/components/message'
import { createElLoading } from '@/components/loading'

const props = defineProps<{ inviid: string }>()

const role = sessionStorage.getItem('role')
let getInvi
if (role == COLLEGE_ADMIN) {
  getInvi = getCollegeInviService(props.inviid)
} else if (role == SUBJECT_ADMIN) {
  getInvi = getInviService(props.inviid)
}

const results = await Promise.all([
  listInviDetailUsersService(props.inviid),
  getInvi,
  getSettingsService()
])

const assignersR = ref<User[]>([])
const invigilationR = ref<Invigilation>()
assignersR.value = results[0] ?? []
invigilationR.value = results[1]
const settingsStore = useSettingStore()

const selectUsersR = ref<User[]>([...assignersR.value])

const notice: Notice = {
  inviId: invigilationR.value?.id,
  date: invigilationR.value?.date,
  stime: invigilationR.value?.time?.starttime,
  etime: invigilationR.value?.time?.endtime,
  unionIds: [],
  noticeUserIds: []
}

const week = getInviWeek(notice.date!, settingsStore.getFirstWeek())
const dayweek = getInviChineseDayweek(notice.date!)

const userIds: string[] = []
const userNames: string[] = []
selectUsersR.value.forEach((u) => {
  notice.noticeUserIds?.push(u.id!)
  notice.unionIds?.push(u.dingUnionId!)
  userIds.push(u.dingUserId!)
  userNames.push(u.name!)
})
// 改为监考第一名教师发起日程
notice.createUnionId = selectUsersR.value[0].dingUnionId
// @ts-ignore
notice.noticeUserIds = JSON.stringify(notice.noticeUserIds)
notice.userIds = userIds.join(',')
//
const noticeMessage = `监考时间: ${notice.date}第${week}周${dayweek} ${notice.stime}~${notice.etime}
监考课程：${invigilationR.value?.course?.courseName}
监考地点：${invigilationR.value?.course?.location}
监考教师：${userNames.join('; ')}`
notice.noticeMessage = noticeMessage

const noticeAssignersF = async () => {
  if (invigilationR.value?.calendarId != null) {
    createMessageDialog(`请勿重复发送通知。如需更改请返回分配页面重新分配监考`)
    return
  }

  // 计算监考前一天9点
  const x = new Date(
    `${invigilationR.value?.date}T${invigilationR.value?.time?.starttime}`
  ).getTime()
  const y = x - 1000 * 60 * 60 * 24
  const z = new Date(y)
  z.setHours(9)
  const remindMinutes = (x - z.getTime()) / (1000 * 60)
  notice.remindMinutes = remindMinutes

  const loading = createElLoading()
  let msg
  try {
    msg = await noticeUsersService(notice)
  } finally {
    loading.close()
  }
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
    <el-col style="margin-bottom: 10px">{{ noticeMessage }}</el-col>
  </el-row>
  <el-row class="my-row">
    <el-col>
      分配结果已保存。
      <br />
      钉钉通知并添加到用户日程？
    </el-col>
    <el-col>
      <el-checkbox-group v-model="selectUsersR">
        <el-checkbox v-for="(user, index) of assignersR" :key="index" :label="user" size="large">
          {{ user.name }}
        </el-checkbox>
      </el-checkbox-group>
    </el-col>
    <el-col>
      <el-button type="success" @click="noticeAssignersF" :disabled="selectUsersR.length == 0">
        提交
      </el-button>
    </el-col>
  </el-row>
</template>
