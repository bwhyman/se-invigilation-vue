<script setup lang="ts">
import {
  addAssignUsersService,
  getInviService,
  listCountsService,
  listDateInvisService,
  listExcludeRulesService,
  listTimetablesService,
  listUsersService
} from '@/services/SubjectService'
import {
  confTime,
  getInviChineseDayweek,
  getInviDayweek,
  getInviWeek,
  stringInviTime
} from '@/services/Utils'
import type { Invigilation, User, InviAssignUser, AssignUser } from '@/types'
import { CLOSED } from '@/services/Const'
import AssignTable from './component/AssignTable.vue'
import { useUserStore } from '@/stores/UserStore'
import router from '@/router'
import { getSettingsService, noticeDingCancelService } from '@/services/CommonService'
import { useSettingStore } from '@/stores/SettingStore'
import InviMessage from '../component/InviInfo.vue'
import { getDepartmentCommentService } from '@/services/SubjectService'
import { createElNotificationSuccess, createMessageDialog } from '@/components/message'
import { ElLoading } from 'element-plus'

const props = defineProps<{ inviid: string }>()
//
const selectedUsers = ref<InviAssignUser[]>([])

const resultInit = await Promise.all([getInviService(props.inviid), getSettingsService()])
const currentInvi = resultInit[0]
if (!currentInvi) {
  const msg = '获取监考信息错误!'
  createMessageDialog(msg)
  throw new Error(msg)
}

const settingsStore = useSettingStore()
//
const userR = storeToRefs(useUserStore()).userS
const assignUsersR = ref<AssignUser>({})

// 当前分配的监考信息
let week = getInviWeek(currentInvi.date!, settingsStore.getFirstWeek())
let dayweek = getInviDayweek(currentInvi.date!)
const amountR = currentInvi.amount!

//
const allP = await Promise.all([
  // 当天课表
  listTimetablesService(week, dayweek),
  // 当天监考
  listDateInvisService(currentInvi.date!),
  // 监考数量
  listCountsService(),
  // 全部教师
  listUsersService(),
  getDepartmentCommentService(),
  listExcludeRulesService()
])

const timetablesR = allP[0] ?? []
const dateInvisR = allP[1] ?? []
const inviCountsS = allP[2] ?? []
const usersS = allP[3] ?? []
const departmentComment = allP[4]
const rulesR = allP[5]

// 分别计算渲染
const groupUsers: InviAssignUser[] = []
const allUsers: User[] = [...usersS]
const closedUsersR: User[] = []
const confUsersR: InviAssignUser[] = []
const currentUsersR: InviAssignUser[] = []

allloop: for (const user of allUsers) {
  // closed
  if (user.inviStatus == CLOSED) {
    closedUsersR.push(user)
    continue
  }

  // 整合监考数量
  const am = inviCountsS.find((ic) => ic.userId == user.id)?.count ?? 0
  // 整合课表
  const tb = timetablesR.filter((tb) => tb.userId == user.id)
  const excludes = rulesR.filter((rule) => rule.userId == user.id)

  // 无论是否冲突，均需整合数据，并展示
  const groupUser: InviAssignUser = {
    id: user.id,
    name: user.name,
    amount: am,
    timetables: tb,
    excludeRules: excludes
  }
  const invisTm: Invigilation[] = []
  dateInvisR.forEach((di) => {
    if (!di.executor) return
    di.executor.forEach((de) => {
      if (de.userId == user.id) {
        invisTm.push(di)
        groupUser.invis = invisTm
      }
    })
  })

  // 课表时间冲突，置于冲突集合
  if (groupUser.timetables) {
    const x = groupUser.timetables!.find((tb) =>
      confTime(currentInvi.date!, currentInvi.time?.starttime!, tb.period!)
    )
    if (x) {
      groupUser.reason = 'timetable'
      confUsersR.push(groupUser)
      continue
    }
  }

  // 考试时间冲突，置于冲突集合
  if (groupUser.invis) {
    for (const invi of groupUser.invis) {
      const currentInviTimeStartTime = new Date(
        `${currentInvi.date} ${currentInvi.time?.starttime}`
      )
      const currentInviTimeEndTime = new Date(`${currentInvi.date} ${currentInvi.time?.endtime}`)
      const thisInviTime = new Date(`${invi.date} ${invi.time?.starttime}`)
      if (thisInviTime >= currentInviTimeStartTime && thisInviTime <= currentInviTimeEndTime) {
        groupUser.reason = 'invi'
        confUsersR.push(groupUser)
        continue allloop
      }
    }
  }

  // 排除冲突
  if (groupUser.excludeRules) {
    for (const exclude of groupUser.excludeRules) {
      if (
        exclude.startweek! <= week &&
        exclude.endweek! >= week &&
        exclude.dayweeks?.includes(dayweek)
      ) {
        for (const per of exclude.periods!) {
          const conf = confTime(currentInvi.date!, currentInvi.time?.starttime!, per)
          if (conf) {
            groupUser.reason = 'rule'
            confUsersR.push(groupUser)
            continue allloop
          }
        }
      }
    }
  }

  // 不冲突
  groupUsers.push(groupUser)
}
// 追加将当前监考教师置于默认状态
if (currentInvi.executor) {
  currentInvi.executor.forEach((exe) => {
    const x = confUsersR.find((us) => us.id == exe.userId)
    if (x) {
      selectedUsers.value.push(x!)
      currentUsersR.push(x!)
      const index = confUsersR.indexOf(x!)
      confUsersR.splice(index, 1)
    }
  })
}
//
groupUsers.sort((x, y) => x.amount! - y.amount!)
confUsersR.sort((x, y) => x.amount! - y.amount!)

const dayweekCN = getInviChineseDayweek(currentInvi.date!)

const handleChange = (user: InviAssignUser) => {
  if (selectedUsers.value.length < amountR) {
    selectedUsers.value.push(user)
    return
  }
  const index = selectedUsers.value.indexOf(user)
  selectedUsers.value.splice(index, 1)
}

const getDisripC = computed(() => (user: InviAssignUser) => {
  const us = selectedUsers.value.filter((u) => u.id == user.id)
  if (us.length == 0) return '分配'
  return us.length
})

const getDisabledC = computed(() => (user: InviAssignUser) => {
  const temp = selectedUsers.value.find((u) => u.id == user.id)
  if (selectedUsers.value.length >= amountR && !temp) {
    return { type: 'warning', disabled: true }
  }
  return { type: 'primary', disabled: false }
})

//
const submitUsers = async () => {
  if (selectedUsers.value.length != currentInvi.amount) {
    createMessageDialog('分配教师数与所需监考数不匹配')
    return
  }

  const loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  if (currentInvi.calendarId) {
    const userIds: string[] = []
    currentInvi.executor!.forEach((ex) => {
      const user = usersS.find((u) => u.id == ex.userId)
      user && userIds.push(user.dingUserId!)
    })
  }
  assignUsersR.value.allocator = stringInviTime({ id: userR.value.id, name: userR.value.name })
  assignUsersR.value.executor = []
  assignUsersR.value.users = []
  selectedUsers.value.forEach((us) => {
    assignUsersR.value.executor?.push(stringInviTime({ id: us.id, name: us.name }))
    assignUsersR.value.users?.push({ id: us.id })
  })

  try {
    await noticeDingCancelService(currentInvi.id!)
    await addAssignUsersService(currentInvi.id!, assignUsersR.value)
    createElNotificationSuccess('监考已分配')
    router.push(`/subject/notices/${props.inviid}`)
  } finally {
    loading.close()
  }

  // const userss: User[] = []

  // assignUsersR.value.users!.forEach((asuser) => {
  //   const u = usersS.find((u) => u.id == asuser.id)
  //   u && userss.push(u)
  // })
  // const msg = await noticeDingService(userR.value, userss, currentInvi)

  // const { messageS, closeF } = storeToRefs(messageStore)
  // messageS.value = `分配结果已保存。通知已发送\n编号：${msg}`
  // closeF.value = () => {
  //   router.push(`/subject/dispatched`)
  // }
}
</script>
<template>
  <!--  -->
  <el-row class="my-row">
    <el-col style="text-align: center">
      <InviMessage :invi="currentInvi" />
    </el-col>
  </el-row>
  <!--  -->
  <el-row class="my-row">
    <el-col :span="2">
      <el-tag type="warning">说明</el-tag>
    </el-col>
    <el-col :span="22">
      提交，保存监考分配记录，在下一步独立操作发送钉钉监考通知。
      <br />
      重复提交，将覆盖原分配记录，并保存新记录。
      <br />
      同一名教师可带自己研究生参加同一场监考，算2次监考。
      <br />
    </el-col>
  </el-row>
  <el-row class="my-row" v-if="departmentComment.length > 0">
    <el-col :span="2">
      <el-tag type="warning">备注</el-tag>
    </el-col>
    <el-col :span="22" style="white-space: pre-wrap">
      {{ departmentComment }}
    </el-col>
  </el-row>
  <el-row class="my-row" v-if="currentUsersR.length > 0">
    <el-col>
      <el-tag size="large">当前</el-tag>
    </el-col>
    <el-col style="margin-bottom: 10px">
      <AssignTable :users="currentUsersR" :dayweek="dayweekCN">
        <template #userAssign="userAssign">
          <el-button
            style="width: 60px"
            :type="getDisabledC(userAssign.user!).type"
            :disabled="getDisabledC(userAssign.user!).disabled"
            @click="handleChange(userAssign.user!)">
            {{ getDisripC(userAssign.user!) }}
          </el-button>
        </template>
      </AssignTable>
    </el-col>
  </el-row>
  <el-row class="my-row">
    <el-col :span="6">
      <el-tag type="success" size="large">建议</el-tag>
    </el-col>
    <el-col :span="2" :offset="16">
      <el-button type="success" :disabled="selectedUsers.length < amountR" @click="submitUsers">
        提交
      </el-button>
    </el-col>
    <el-col style="margin-bottom: 10px">
      <AssignTable :users="groupUsers" :dayweek="dayweekCN">
        <template #userAssign="userAssign">
          <el-button
            style="width: 60px"
            :type="getDisabledC(userAssign.user!).type"
            :disabled="getDisabledC(userAssign.user!).disabled"
            @click="handleChange(userAssign.user!)">
            {{ getDisripC(userAssign.user!) }}
          </el-button>
        </template>
      </AssignTable>
    </el-col>

    <el-col>
      <el-tag type="warning" size="large">冲突</el-tag>
    </el-col>
    <el-col style="margin-bottom: 10px">
      <AssignTable :users="confUsersR" :dayweek="dayweekCN">
        <template #userAssign="userAssign">
          <el-button
            style="width: 60px"
            :type="getDisabledC(userAssign.user!).type"
            :disabled="getDisabledC(userAssign.user!).disabled"
            @click="handleChange(userAssign.user!)">
            {{ getDisripC(userAssign.user!) }}
          </el-button>
        </template>
      </AssignTable>
    </el-col>

    <el-tag type="danger" size="large">关闭</el-tag>
    <el-col>
      <el-table :data="closedUsersR">
        <el-table-column type="index" label="" width="50" />
        <el-table-column>
          <template #default="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
      </el-table>
    </el-col>
  </el-row>
</template>
