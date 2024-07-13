<script setup lang="ts">
import { createElLoading } from '@/components/loading'
import { createElNotificationSuccess } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import { CommonService } from '@/services/CommonService'
import { SubjectService } from '@/services/SubjectService'
import { useSettingStore } from '@/stores/SettingStore'
import { useUserStore } from '@/stores/UserStore'
import type { Invigilation, Notice, User } from '@/types'
import { getFinalNotice, getInitNotice } from '@/views/main/component/AssignNotice'
import InviMessage from '@/views/main/component/InviInfo.vue'
import { createAssign, createAssigns, createInvis } from './AssignView'
import DepartmentUser from './functions/finduser/DepartmentUser.vue'

const params = useRoute().params as { inviid: string }

const inviR = await CollegeService.getCollegeInviService(params.inviid)
if (!inviR || !inviR.value) {
  throw '获取监考信息错误!'
}
const settingStore = useSettingStore()
const exposeR = ref<{ selectUser: User; clearUser: Function }>()
const selectUsersR = ref<User[]>([])
const newInvisR = ref<Invigilation[]>([])
const assignNoticesR = ref<Notice[]>([])

const createUserR = useUserStore().userS
watch(
  () => exposeR.value?.selectUser,
  () => {
    if (!exposeR.value?.selectUser.id) return
    if (!createUserR.value) return
    selectUsersR.value.push(exposeR.value?.selectUser) && exposeR.value?.clearUser()
  }
)

//
const assignF = async () => {
  let invi
  if (selectUsersR.value.length == 0 || !createUserR.value) return

  // 如果原监考已发送通知，则发送取消通知
  if (inviR.value.calendarId) {
    inviR.value.id && (await CommonService.noticeDingCancelService(inviR.value))
  }

  newInvisR.value = []
  // 预分配教师是相同专业
  const firstDepid = selectUsersR.value[0].department?.depId
  const isSameDepart = selectUsersR.value.every((su) => su.department?.depId === firstDepid)
  if (isSameDepart) {
    const assignUser = createAssign(selectUsersR.value, createUserR.value)
    invi = await CollegeService.addAssignService(inviR.value.id!, assignUser)
    invi && newInvisR.value.push(invi)
  } else {
    // 如果不相同，则创建新监考
    const newInvis = createInvis(inviR.value, createUserR.value, selectUsersR.value)
    const invis = await CollegeService.addInvigilationsService(newInvis)
    newInvisR.value = invis
    // 创建新分配
    const assigns = createAssigns(createUserR.value, selectUsersR.value, invis)
    for (let index = 0; index < assigns.length; index++) {
      await CollegeService.addAssignService(invis[index].id!, assigns[index])
    }

    // 移除原监考
    inviR.value.id && (await CollegeService.delInviService(inviR.value.id))
  }

  selectUsersR.value = []
  // 初始化通知
  assignNoticesR.value = []
  for (const invi of newInvisR.value) {
    const assigners = await SubjectService.listInviDetailUsersService(invi.id!)
    const notice = getInitNotice(assigners, invi, settingStore.getFirstWeek())
    const dingUsers: User[] = []
    const noDingUsers: User[] = []

    for (const us of assigners) {
      us.dingUserId ? dingUsers.push(us) : noDingUsers.push(us)
    }
    const noticeFinal = getFinalNotice(notice, assigners)
    assignNoticesR.value.push(noticeFinal)
  }
  createElNotificationSuccess('监考分配成功')
}

//
const closeTagF = (index: number) => {
  selectUsersR.value.splice(index, 1)
  newInvisR.value.splice(index, 1)
}

//
const noticeF = async () => {
  const loading = createElLoading()
  try {
    for (const notice of assignNoticesR.value) {
      let msg = await SubjectService.noticeUsersService(notice)
      msg && createElNotificationSuccess(`通知发送成功。编号：${msg}`)
    }
  } finally {
    loading.close()
  }
}
</script>
<template>
  <el-row class="my-row">
    <el-col style="text-align: center">
      <InviMessage :invi="inviR" />
    </el-col>
  </el-row>
  <el-row class="my-row">
    <el-col v-if="inviR?.executor" class="my-col">
      <p>原监考专业：{{ inviR.department?.departmentName }}</p>
      <p>
        原监考教师：
        <el-tag
          v-for="(u, index) of inviR.executor"
          :key="index"
          size="large"
          style="min-width: 60px; margin-right: 10px">
          {{ u.userName }}
        </el-tag>
      </p>
    </el-col>
    <template v-if="assignNoticesR.length == 0">
      <el-col class="my-col">
        <el-tag type="danger">
          强制重新分配。允许跨专业分配，允许超过实际监考人数限制，允许同一教师分配多次。
        </el-tag>
      </el-col>
      <el-col class="my-col" :span="10">
        <DepartmentUser ref="exposeR" />
      </el-col>
      <el-col></el-col>
      <el-col class="my-col">
        <hr />
      </el-col>
      <el-col :span="3">
        <el-button
          :disabled="!(selectUsersR.length > 0)"
          style="margin-bottom: 5px"
          @click="assignF"
          type="success">
          新监考提交
        </el-button>
      </el-col>
      <el-col class="my-col" :span="16">
        <el-tag
          v-for="(invi, index) of selectUsersR"
          :key="index"
          closable
          size="large"
          @close="closeTagF(index)">
          {{ selectUsersR[index].department?.departmentName }} : {{ selectUsersR[index].name }}
        </el-tag>
      </el-col>
    </template>

    <template v-if="assignNoticesR.length > 0">
      <el-col class="my-col">
        <hr />
      </el-col>
      <el-col class="my-col">
        <el-tag type="danger" size="large">监考分配已记录，是否发送通知？</el-tag>
      </el-col>
      <el-col class="my-col">
        <template v-for="(assUser, index) of assignNoticesR" :key="index">
          <p>
            {{ assUser.noticeMessage }}
          </p>
        </template>
      </el-col>
      <el-col class="my-col">
        <el-button @click="noticeF" type="success">发出以上监考通知</el-button>
      </el-col>
    </template>
  </el-row>
</template>
