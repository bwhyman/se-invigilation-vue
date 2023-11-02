<script setup lang="ts">
import { getSettingsService } from '@/services/CommonService'
import {
  getInviService,
  listInviDetailUsersService,
  noticeUsersService
} from '@/services/SubjectService'
import { getInviChineseDayweek, getInviWeek } from '@/services/Utils'
import { useMessageStore } from '@/stores/MessageStore'
import { useSettingStore } from '@/stores/SettingStore'
import { useUserStore } from '@/stores/UserStore'
import type { Invigilation, Notice, User } from '@/types'
import { SUBJECT_ADMIN, COLLEGE_ADMIN } from '@/services/Const'
import router from '@/router'
import { getCollegeInviService } from '@/services/CollegeService'

const props = defineProps<{ inviid: string }>()

const userS = storeToRefs(useUserStore()).userS

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
  createUnionId: userS.value.dingUnionId,
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
// @ts-ignore
notice.noticeUserIds = JSON.stringify(notice.noticeUserIds)
notice.userIds = userIds.join(',')
//
const noticeMessage = `监考时间: ${notice.date}第${week}周${dayweek} ${notice.stime}-${notice.etime}
监考课程：${invigilationR.value?.course?.courseName}
监考地点：${invigilationR.value?.course?.location}
监考教师：${userNames.join(',')}`
notice.noticeMessage = noticeMessage

const noticeAssignersF = async () => {
  const msg = await noticeUsersService(notice)

  const { messageS, closeF } = storeToRefs(useMessageStore())
  msg && (messageS.value = `通知发送成功。编号：${msg}`)
  closeF.value = () => {
    const role = sessionStorage.getItem('role')
    if (role == SUBJECT_ADMIN) {
      router.push('/subject/dispatched')
    }
    if (role == COLLEGE_ADMIN) {
      router.push('/college/imported')
    }
  }
}
</script>
<template>
  <el-row class="my-row">
    <el-col style="margin-bottom: 10px">{{ noticeMessage }}</el-col>
  </el-row>
  <el-row class="my-row">
    <el-col>已完成分配。钉钉通知/并添加到用户日程？</el-col>
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
