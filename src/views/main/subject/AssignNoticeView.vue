<script setup lang="ts">
import router from '@/router'
import { getInviService } from '@/services/CommonService'
import { listInviDetailUsersService, noticeUsersService } from '@/services/SubjectService'
import { getInviChineseDayweek, getInviWeek } from '@/services/Utils'
import { useMessageStore } from '@/stores/MessageStore'
import { useUserStore } from '@/stores/UserStore'
import type { Invigilation, Notice, User } from '@/types'

const props = defineProps<{ inviid: string }>()

const userS = storeToRefs(useUserStore()).userS

const results = await Promise.all([
  listInviDetailUsersService(props.inviid),
  getInviService(props.inviid)
])

const assignersR = ref<User[]>([])
const invigilationR = ref<Invigilation>()
assignersR.value = results[0] ?? []
invigilationR.value = results[1]

const selectUsersR = ref<User[]>([])

const notice: Notice = {
  inviId: invigilationR.value?.id,
  createUnionId: userS.value.dingUnionId,
  date: invigilationR.value?.date,
  stime: invigilationR.value?.time?.starttime,
  etime: invigilationR.value?.time?.endtime,
  unionIds: []
}
const week = getInviWeek(notice.date!)
const dayweek = getInviChineseDayweek(notice.date!)

const noticeAssignersF = () => {
  const userIds: string[] = []
  const userNames: string[] = []
  selectUsersR.value.forEach((u) => {
    notice.unionIds?.push(u.dingUnionId!)
    userIds.push(u.dingUserId!)
    userNames.push(u.name!)
  })

  notice.userIds = userIds.join(',')
  //
  const noticeMessage = `监考时间: ${notice.date}第${week}周${dayweek} ${notice.stime}-${
    notice.etime
  }
监考课程：${invigilationR.value?.course?.courseName}
监考地点：${invigilationR.value?.course?.location}
监考教师：${userNames.join(',')}`
  notice.noticeMessage = noticeMessage

  noticeUsersService(notice).then((msg) => {
    const { messageS, closeF } = storeToRefs(useMessageStore())
    msg && (messageS.value = `通知发送成功。编号：${msg}`)
    closeF.value = () => {
      router.push('/subject/dispatched')
    }
  })
}
</script>
<template>
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
