<script setup lang="ts">
import { createElLoading } from '@/components/loading'
import { createElNotificationSuccess } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import { CommonService } from '@/services/CommonService'
import { DISPATCH } from '@/services/Const'
import { SubjectService } from '@/services/SubjectService'
import { stringInviTime } from '@/services/Utils'
import { useSettingStore } from '@/stores/SettingStore'
import { useUserStore } from '@/stores/UserStore'
import type { AssignUser, Invigilation, Notice, User } from '@/types'
import InviMessage from '@/views/main/component/InviInfo.vue'
import { getFinalNotice, getInitNotice } from '../component/AssignNotice'
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
    newInvisR.value = []
    for (const user of selectUsersR.value) {
      const inviN: Invigilation = {}
      inviN.collId = createUserR.value.department?.collId
      inviN.department = {
        depId: user.department?.depId,
        departmentName: user.department?.departmentName
      }
      inviN.importer = stringInviTime(createUserR.value)
      inviN.dispatcher = stringInviTime(createUserR.value)
      inviN.date = inviR.value.date
      inviN.time = inviR.value.time
      inviN.course = inviR.value.course
      inviN.amount = 1
      inviN.status = DISPATCH
      newInvisR.value.push(inviN)
    }
  }
)

//
const assignF = async () => {
  if (newInvisR.value.length == 0) return
  const invis = await CollegeService.addInvigilationsService(newInvisR.value)
  newInvisR.value = invis
  for (let index = 0; index < invis.length; index++) {
    const uss: User[] = []
    const dep = selectUsersR.value[index].department
    const allocator = stringInviTime(createUserR.value!)
    const executor = [stringInviTime(selectUsersR.value[index])]
    uss.push({ id: selectUsersR.value[index].id })
    const u: AssignUser = { department: dep, allocator: allocator, executor: executor, users: uss }
    await CollegeService.addAssignService(invis[index].id!, u)
  }

  // 如果当前监考已经被分配。发送取消监考通知
  if (inviR.value.executor) {
    inviR.value.id && (await CommonService.noticeDingCancelService(inviR.value))
  }
  // 移除原监考
  inviR.value.id && (await CollegeService.delInviService(inviR.value.id))
}

//
const closeTagF = (index: number) => {
  selectUsersR.value.splice(index, 1)
  newInvisR.value.splice(index, 1)
}

//
const noticeF = async () => {
  for (const invi of newInvisR.value) {
    const assigners = await SubjectService.listInviDetailUsersService(invi.id!)
    const notice = getInitNotice(assigners, invi, settingStore.getFirstWeek())
    const dingUsers: User[] = []
    const noDingUsers: User[] = []

    for (const us of assigners) {
      us.dingUserId ? dingUsers.push(us) : noDingUsers.push(us)
    }
    const noticeFinal = getFinalNotice(notice, selectUsersR.value)
    const loading = createElLoading()
    let msg
    try {
      msg = await SubjectService.noticeUsersService(noticeFinal)
    } finally {
      loading.close()
    }
    msg && createElNotificationSuccess(`通知发送成功。编号：${msg}`)
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
        <hr />
      </el-col>
      <el-col class="my-col">
        <el-tag type="danger">
          强制重新分配。将删除原监考分配，允许跨专业分配，允许超过实际监考人数限制，允许同一教师分配多次。
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
          :disabled="!(newInvisR.length > 0)"
          style="margin-bottom: 5px"
          @click="assignF"
          type="success">
          新监考提交
        </el-button>
      </el-col>
      <el-col class="my-col" :span="16">
        <el-tag
          v-for="(invi, index) of newInvisR"
          :key="index"
          closable
          size="large"
          @close="closeTagF(index)">
          {{ invi.department?.departmentName }} : {{ selectUsersR[index].name }}
        </el-tag>
      </el-col>
    </template>

    <template v-if="assignNoticesR.length > 0">
      <el-col class="my-col">
        <hr />
      </el-col>
      <el-col class="my-col">
        <template v-for="(assUser, index) of assignNoticesR" :key="index">
          <p>
            {{ assUser.noticeMessage }}
          </p>
        </template>
      </el-col>
      <el-col class="my-col">
        <el-button @click="noticeF">通知</el-button>
      </el-col>
    </template>
  </el-row>
</template>
