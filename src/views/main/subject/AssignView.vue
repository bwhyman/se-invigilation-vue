<script setup lang="ts">
import {
  addAssignUsersService,
  listCountsService,
  listDateInvisService,
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
import { useMessageStore } from '@/stores/MessageStore'
import { getInviService, getSettingsService } from '@/services/CommonService'
import { useSettingStore } from '@/stores/SettingStore'

const props = defineProps<{ inviid: string }>()
const messageStore = useMessageStore()

//
const selectedUsers = ref<InviAssignUser[]>([])

const resultInit = await Promise.all([getInviService(props.inviid), getSettingsService()])
const currentInvi = resultInit[0] ?? {}
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
  listUsersService()
])

const timetablesR = allP[0] ?? []
const dateInvisR = allP[1] ?? []
const inviCountsS = allP[2] ?? []
const usersS = allP[3] ?? []

// 分别计算渲染
const groupUsers: InviAssignUser[] = []
const allUsers: User[] = [...usersS]
const closedUsersR: User[] = []
const confUsersR: InviAssignUser[] = []

const dateIns: {
  userId?: string
  userName?: string
  time?: string
}[] = []
dateInvisR.forEach((di) => {
  di.executor?.forEach((ex) => {
    dateIns.push(ex)
  })
})

for (let index = 0; index < allUsers.length; index++) {
  // closed
  if (allUsers[index].inviStatus == CLOSED) {
    closedUsersR.push(allUsers[index])
    allUsers.splice(index, 1)
    index--
    continue
  }
  // 整合监考数量
  const am = inviCountsS.find((ic) => ic.userId == allUsers[index].id)?.count ?? 0
  // 整合课表
  const tb = timetablesR.filter((tb) => tb.userId == allUsers[index].id)

  const invisTm: Invigilation[] = []

  dateInvisR.forEach((di) => {
    if (!di.executor) return

    di.executor.forEach((de) => {
      if (de.userId == allUsers[index].id) {
        invisTm.push(di)
      }
    })
  })

  groupUsers.push({
    id: allUsers[index].id,
    name: allUsers[index].name,
    amount: am,
    timetables: tb,
    invis: invisTm
  })
}
groupUsers.sort((x, y) => x.amount! - y.amount!)

for (let index = 0; index < groupUsers.length; index++) {
  if (groupUsers[index].timetables) {
    const x = groupUsers[index].timetables!.find((tb) =>
      confTime(currentInvi.date!, currentInvi.time?.starttime!, tb.period!)
    )
    if (x) {
      confUsersR.push(groupUsers[index])
      groupUsers.splice(index, 1)
      index--
      continue
    }
  }

  if (groupUsers[index].invis?.length! > 0) {
    for (const invi of groupUsers[index].invis!) {
      if (invi.executor) {
        for (const ex of invi.executor) {
          const currentInviTimeStartTime = new Date(
            `${currentInvi.date} ${currentInvi.time?.starttime}`
          )
          const currentInviTimeEndTime = new Date(
            `${currentInvi.date} ${currentInvi.time?.endtime}`
          )
          const thisInviTime = new Date(`${invi.date} ${invi.time?.starttime}`)

          if (thisInviTime >= currentInviTimeStartTime && thisInviTime <= currentInviTimeEndTime) {
            const x = groupUsers.find((gu) => gu.id == ex.userId)
            if (x) {
              const ind = groupUsers.indexOf(x)
              confUsersR.push(groupUsers[ind])
              groupUsers.splice(ind, 1)
              index--
            }

            continue
          }
        }
      }
    }
  }
}

// 追加将当前监考教师置于默认状态
if (currentInvi.executor) {
  currentInvi.executor.forEach((exe) => {
    const x = confUsersR.filter((us) => us.id == exe.userId)
    selectedUsers.value.push(...x)
  })
}

const WeekC = getInviWeek(currentInvi.date!, settingsStore.getFirstWeek())
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
const submitUsers = () => {
  if (selectedUsers.value.length != currentInvi.amount) {
    const { messageS } = storeToRefs(messageStore)
    messageS.value = '分配教师数与所需监考数不匹配'
    return
  }

  assignUsersR.value.executor = []
  if (currentInvi.calendarId) {
    const userIds: string[] = []
    currentInvi.executor!.forEach((ex) => {
      const user = usersS.find((u) => u.id == ex.userId)
      user && userIds.push(user.dingUserId!)
    })
  }
  assignUsersR.value.allocator = stringInviTime({ id: userR.value.id, name: userR.value.name })

  selectedUsers.value.forEach((us) => {
    assignUsersR.value.executor?.push(stringInviTime({ id: us.id, name: us.name }))
  })

  addAssignUsersService(currentInvi.id!, assignUsersR.value).then(() => {
    const { messageS, closeF } = storeToRefs(messageStore)
    messageS.value = '分配结果已保存'
    closeF.value = () => {
      router.push(`/subject/notices/${props.inviid}`)
    }
  })
}
</script>
<template>
  <!--  -->
  <el-row class="my-row">
    <el-col style="text-align: center">
      {{ currentInvi.date }} 第{{ WeekC }}周 {{ dayweekCN }} {{ currentInvi.time?.starttime }} -
      {{ currentInvi.time?.endtime }}
      <br />
      {{ currentInvi.course!.teacherName }} / {{ currentInvi.course!.courseName }} /
      {{ currentInvi.course!.clazz }}

      <br />
      {{ currentInvi.course!.location }} /
      <el-tag>{{ currentInvi.amount }}</el-tag>
      人
    </el-col>
  </el-row>
  <!--  -->
  <el-row class="my-row">
    <el-col :span="2">
      <el-tag type="warning">说明：</el-tag>
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

  <el-row class="my-row">
    <el-col :span="6">
      <el-tag type="success" size="large">建议</el-tag>
    </el-col>
    <el-col :span="8">
      <template v-if="currentInvi.executor?.length! > 0">
        当前监考教师：
        <template v-for="(exec, index) of currentInvi.executor" :key="index">
          <el-tag size="large" type="success" style="margin-right: 5px">{{ exec.userName }}</el-tag>
        </template>
      </template>
    </el-col>
    <el-col :span="2" :offset="8">
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
        <el-table-column type="index" label="#" width="50" />
        <el-table-column>
          <template #default="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
      </el-table>
    </el-col>
  </el-row>
</template>
