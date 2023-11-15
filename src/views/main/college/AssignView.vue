<script setup lang="ts">
import router from '@/router'
import {
  addAssignService,
  getCollegeInviService,
  getUserByNameServie,
  updateInvisService
} from '@/services/CollegeService'
import { getSettingsService, noticeDingCancelService } from '@/services/CommonService'
import { getInviChineseDayweek, getInviWeek, stringInviTime } from '@/services/Utils'
import { useMessageStore } from '@/stores/MessageStore'
import { useSettingStore } from '@/stores/SettingStore'
import { useUserStore } from '@/stores/UserStore'
import type { AssignUser, Invigilation } from '@/types'

const props = defineProps<{ inviid: string; name: string }>()

const results = await Promise.all([
  getCollegeInviService(props.inviid),
  getUserByNameServie(props.name),
  getSettingsService()
])

const inviR = results[0]
if (!inviR) {
  const messageStore = useMessageStore()
  const msg = '获取监考信息错误!'
  storeToRefs(messageStore).messageS.value = msg
  throw new Error(msg)
}

const user = results[1]
const messageStore = useMessageStore()
const settingsStore = useSettingStore()

if (!user) {
  storeToRefs(messageStore).messageS.value = '未找到考试课程教师，请重新确认'
}
const createUserR = useUserStore().userS

const WeekC = getInviWeek(inviR.date!, settingsStore.getFirstWeek())
const dayweekC = getInviChineseDayweek(inviR.date!)

const assignF = async () => {
  const invi: Invigilation = { id: inviR.id }
  invi.department = {
    depId: user?.department?.depId,
    departmentName: user?.department?.departmentName
  }
  invi.dispatcher = stringInviTime({ id: createUserR.id, name: createUserR.name })
  await updateInvisService([invi])

  const assignUser: AssignUser = { executor: [], users: [] }
  assignUser.department = {
    depId: user?.department?.depId,
    departmentName: user?.department?.departmentName
  }
  assignUser.allocator = stringInviTime({ id: createUserR.id, name: createUserR.name })
  assignUser.executor?.push(stringInviTime({ id: user?.id, name: user?.name }))
  assignUser.users?.push({ id: user?.id, name: user?.name })
  await noticeDingCancelService(invi!.id!)
  await addAssignService(inviR.id!, assignUser)
  storeToRefs(messageStore).messageS.value = '提交成功'
  storeToRefs(messageStore).closeF.value = () => {
    router.push(`/college/invinotice/${inviR.id}`)
  }
}
</script>
<template>
  <el-row class="my-row">
    <el-col style="text-align: center">
      {{ inviR.date }} / 第{{ WeekC }}周 / {{ dayweekC }}/ {{ inviR.time?.starttime }} -
      {{ inviR.time?.endtime }} / {{ inviR.course!.teacherName }} / {{ inviR.course!.courseName }} /
      {{ inviR.course!.clazz }}

      <br />
      {{ inviR.course!.location }} /
      <el-tag>{{ inviR.amount }}</el-tag>
      人
    </el-col>
  </el-row>
  <el-row class="my-row">
    <el-col style="margin-bottom: 10px">
      <el-tag size="large">
        {{ user?.name }} / {{ user?.account }} / {{ user?.department?.departmentName }}
      </el-tag>
    </el-col>

    <el-col>
      <el-button type="success" @click="assignF">提交</el-button>
    </el-col>
  </el-row>
</template>
