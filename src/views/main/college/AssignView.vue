<script setup lang="ts">
import router from '@/router'
import {
  addAssignService,
  getCollegeInviService,
  listOpenedDepartmentsService,
  listUsersByNameService,
  updateInvisService
} from '@/services/CollegeService'
import { getSettingsService, noticeDingCancelService } from '@/services/CommonService'
import { getInviChineseDayweek, getInviWeek, stringInviTime } from '@/services/Utils'
import { useMessageStore } from '@/stores/MessageStore'
import { useSettingStore } from '@/stores/SettingStore'
import { useUserStore } from '@/stores/UserStore'
import type { AssignUser, Invigilation } from '@/types'

const props = defineProps<{ inviid: string; depid: string; name: string }>()
const results = await Promise.all([
  getCollegeInviService(props.inviid),
  listUsersByNameService(props.depid, props.name),
  listOpenedDepartmentsService(),
  getSettingsService()
])

const inviR = results[0]
if (!inviR) {
  const messageStore = useMessageStore()
  const msg = '获取监考信息错误!'
  storeToRefs(messageStore).messageS.value = msg
  throw new Error(msg)
}

const users = results[1]
const departments = results[2]
const depart = departments.find((d) => d.id == props.depid)
const messageStore = useMessageStore()
const settingsStore = useSettingStore()

if (users.length == 0) {
  storeToRefs(messageStore).messageS.value = '该专业未找到考试课程教师，请重新确认'
}
const userR = useUserStore().userS

const WeekC = getInviWeek(inviR.date!, settingsStore.getFirstWeek())
const dayweekC = getInviChineseDayweek(inviR.date!)

const selectUserR = ref<string>()
const assignF = async () => {
  const selUser = users.find((u) => u.id == selectUserR.value)
  if (!selUser) {
    storeToRefs(messageStore).messageS.value = '选择错误'
    return
  }

  const invi: Invigilation = { id: inviR.id }
  invi.department = { depId: depart?.id, departmentName: depart?.name }
  invi.dispatcher = stringInviTime({ id: userR.id, name: userR.name })
  await updateInvisService([invi])

  const assignUser: AssignUser = { executor: [], users: [] }
  assignUser.department = { depId: depart?.id, departmentName: depart?.name }
  assignUser.allocator = stringInviTime({ id: userR.id, name: userR.name })
  assignUser.executor?.push(stringInviTime({ id: selUser.id!, name: selUser.name! }))
  assignUser.users?.push({ id: selUser.id!, name: selUser.name! })
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
    <el-col :span="6"></el-col>
    <el-col :span="8">
      <el-tag>{{ depart?.name }}</el-tag>
    </el-col>
    <el-col :span="2" :offset="8">
      <el-button type="success" :disabled="!selectUserR" @click="assignF">提交</el-button>
    </el-col>
    <el-col>
      <el-radio-group
        v-model="selectUserR"
        class="ml-4"
        style="margin-bottom: 10px; margin-right: 10px">
        <el-radio-button v-for="(user, index) of users" :key="index" :label="user.id" size="large">
          {{ user.name }} / {{ user.account }}
        </el-radio-button>
      </el-radio-group>
    </el-col>
  </el-row>
</template>
