<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import router from '@/router'
import { listUserDingIdsService, sendInviRemarkNoticeService } from '@/services/CollegeService'
import { getSettingsService } from '@/services/CommonService'
import { getInviChineseDayweek, getInviWeek } from '@/services/Utils'
import type { Invigilation, NoticeRemark } from '@/types'
import { render } from 'vue'

const props = defineProps<{ invis: Invigilation[] }>()
const invis = props.invis
const invi: Invigilation = invis[0]

const settingsStore = await getSettingsService()
const week = getInviWeek(invi.date!, settingsStore.getFirstWeek())
const chineseDayWeek = getInviChineseDayweek(invi.date!)

let userids: string[] = []
invis.forEach((invi) => {
  const ids = invi.executor?.map((exe) => exe.userId) ?? []
  userids?.push(...ids)
})
userids = Array.from(new Set(userids))
const dialogFormVisible = ref(true)
const message = ref(
  `监考信息：${invi.course?.courseName} ${invi.date}第${week}周${chineseDayWeek} ${invi.time?.starttime}。
请提前20分钟在大厅取卷，监考结束请送至`
)

//
const sendF = async () => {
  const users = await listUserDingIdsService(userids)
  if (users.length == 0) {
    throw '获取用户钉钉账号失败'
  }
  const inviids = invis.map((i) => i.id!)
  if (inviids.length == 0) {
    throw '获取监考信息失败'
  }
  const notice: NoticeRemark = {
    dingUserIds: users.map((u) => u.dingUserId).join(','),
    remark: message.value,
    inviIds: inviids
  }
  const result = await sendInviRemarkNoticeService(notice)
  if (result && result.length > 0) {
    createElNotificationSuccess(`备注通知发送成功。${result}`)
    router.go(0)
  }
}

const closeDialog = () => render(null, document.body)
</script>
<template>
  <el-dialog v-model="dialogFormVisible" title="发送监考备注工作通知" @close="closeDialog">
    <p>监考课程名称及考试时间相同，为同一门考试。</p>
    <p>
      共涉及监考
      <el-tag>{{ invis.length }}</el-tag>
      个，教师
      <el-tag>{{ userids.length }}</el-tag>
      人。
    </p>
    <el-form>
      <el-input v-model="message" :autosize="{ minRows: 3, maxRows: 4 }" type="textarea" />
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="sendF">Confirm</el-button>
      </span>
    </template>
  </el-dialog>
</template>
