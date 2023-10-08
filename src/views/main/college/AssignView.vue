<script setup lang="ts">
import router from '@/router'
import {
  addAssignService,
  listOpenedDepartmentsService,
  listUsersByNameService,
  updateInvisService
} from '@/services/CollegeService'
import { getInviService } from '@/services/CommonService'
import { listInviDetailUsersService, noticeUsersService } from '@/services/SubjectService'
import { getInviChineseDayweek, getInviWeek, stringInviTime } from '@/services/Utils'
import { useMessageStore } from '@/stores/MessageStore'
import { useUserStore } from '@/stores/UserStore'
import type { AssignUser, Invigilation, Notice, User } from '@/types'

const props = defineProps<{ inviid: string; depid: string; name: string }>()
const results = await Promise.all([
  getInviService(props.inviid),
  listUsersByNameService(props.depid, props.name),
  listOpenedDepartmentsService()
])

const inviR = results[0] ?? {}
const users = results[1]
const departments = results[2]
const depart = departments.find((d) => d.id == props.depid)
const messageStore = useMessageStore()
if (users.length == 0) {
  storeToRefs(messageStore).messageS.value = '该专业未找到考试课程教师，请重新确认'
}
const userR = useUserStore().userS

const WeekC = computed(() => (date: string) => getInviWeek(date))
const dayweekC = computed(() => (date: string) => getInviChineseDayweek(date))

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

  const assignUser: AssignUser = { executor: [] }
  assignUser.depId = depart?.id
  assignUser.allocator = stringInviTime({ id: userR.id, name: userR.name })
  assignUser.executor?.push(stringInviTime({ id: selUser.id!, name: selUser.name! }))
  addAssignService(inviR.id!, assignUser).then(() => {
    storeToRefs(messageStore).messageS.value = '提交成功'
    storeToRefs(messageStore).closeF.value = () => {
      listInviDetailUsersService(inviR.id!).then((us) => {
        assignersR.value = us
        noticeR.value = true
      })
    }
  })
}

// 通知
const notice: Notice = {
  inviId: inviR.id,
  createUnionId: userR.dingUnionId,
  date: inviR.date,
  stime: inviR.time?.starttime,
  etime: inviR.time?.endtime,
  unionIds: []
}

const noticeR = ref(false)
const assignersR = ref<User[]>([])
const selectUsersR = ref<User[]>([])

const noticeAssignersF = () => {
  const userIds: string[] = []
  const userNames: string[] = []
  selectUsersR.value.forEach((u) => {
    notice.unionIds?.push(u.dingUnionId!)
    userIds.push(u.dingUserId!)
    userNames.push(u.name!)
  })

  notice.userIds = userIds.join(',')
  const week = getInviWeek(notice.date!)
  const dayweek = getInviChineseDayweek(notice.date!)
  //
  const noticeMessage = `监考时间: ${notice.date}第${week}周${dayweek} ${notice.stime}-${
    notice.etime
  }
监考课程：${inviR.course?.courseName}
监考地点：${inviR.course?.location}
监考教师：${userNames.join(',')}`
  notice.noticeMessage = noticeMessage

  noticeUsersService(notice).then((msg) => {
    const { messageS, closeF } = storeToRefs(useMessageStore())
    msg && (messageS.value = `通知发送成功。编号：${msg}`)
    closeF.value = () => {
      router.push('/college/imported')
    }
  })
}
</script>
<template>
  <el-row class="my-row">
    <el-col style="text-align: center">
      {{ inviR.date }} / 第{{ WeekC(inviR.date!) }}周 / {{ dayweekC(inviR.date!) }}/
      {{ inviR.time?.starttime }} - {{ inviR.time?.endtime }} / {{ inviR.course!.teacherName }} /
      {{ inviR.course!.courseName }} /
      {{ inviR.course!.clazz }}

      <br />
      {{ inviR.course!.location }} /
      <el-tag>{{ inviR.amount }}</el-tag>
      人
    </el-col>
  </el-row>
  <el-row class="my-row" v-if="!noticeR">
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
  <!--  -->
  <el-row class="my-row" v-if="noticeR">
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
