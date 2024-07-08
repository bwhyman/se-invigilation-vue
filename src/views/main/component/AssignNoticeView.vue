<script setup lang="ts">
import { getSettingsService } from '@/services/CommonService'
import { SubjectService } from '@/services/SubjectService'
import { getInviChineseDayweek, getInviWeek } from '@/services/Utils'
import type { Invigilation, Notice, User } from '@/types'
import { SUBJECT_ADMIN, COLLEGE_ADMIN } from '@/services/Const'
import router from '@/router'
import { CollegeService } from '@/services/CollegeService'
import { createElNotificationSuccess } from '@/components/message'
import { createElLoading } from '@/components/loading'

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
  getInvi,
  getSettingsService()
])

const assignersR = ref<User[]>(results[0] ?? [])

const dingUsers: User[] = []
const noDingUsers: User[] = []

for (const us of assignersR.value) {
  us.dingUserId ? dingUsers.push(us) : noDingUsers.push(us)
}

const invigilationR = ref<Invigilation>()
invigilationR.value = results[1]?.value
const settingsStore = results[2]

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
    throw `请勿重复发送通知。如需更改请返回分配页面重新分配监考`
  }

  // 计算监考前一天9点
  const x = new Date(
    `${invigilationR.value?.date}T${invigilationR.value?.time?.starttime}`
  ).getTime()
  const y = x - 1000 * 60 * 60 * 24
  const z = new Date(y)
  z.setHours(9)
  z.setMinutes(0)
  z.setSeconds(0)
  const remindMinutes = (x - z.getTime()) / (1000 * 60)
  notice.remindMinutes = remindMinutes

  const loading = createElLoading()
  let msg
  try {
    msg = await SubjectService.noticeUsersService(notice)
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
    <el-col style="margin-bottom: 10px">
      分配结果已保存。
      <br />
      钉钉通知并添加到用户日程？
    </el-col>
    <el-col style="margin-bottom: 10px">
      <el-checkbox-group v-model="selectUsersR">
        <el-checkbox v-for="(user, index) of dingUsers" :key="index" :label="user" size="large">
          {{ user.name }}
          <el-tag type="danger" v-if="!user.dingUserId">该用户没有钉钉信息无法发送通过</el-tag>
        </el-checkbox>
      </el-checkbox-group>
    </el-col>
    <el-col style="margin-bottom: 10px">
      <el-tag type="danger" v-if="noDingUsers.length > 0" size="large" style="margin-bottom: 10px">
        以下用户没有钉钉信息无法向其发送通过
      </el-tag>
      <br />
      <el-tag v-for="(user, index) of noDingUsers" :key="index" size="large">
        {{ user.name }}
      </el-tag>
    </el-col>
    <el-col style="margin-bottom: 10px">
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
