<script setup lang="ts">
import {
  addAssignUsersService,
  listCountsService,
  listDateInvisService,
  listTimetablesService
} from '@/services/SubjectService'
import { useUsersStore } from '@/stores/UsersStore'
import {
  confTime,
  getInviChineseDayweek,
  getInviDayweek,
  getInviWeek,
  stringInviTime
} from '@/services/Utils'
import type { Invigilation, User, InviCount, Timetable, InviAssignUser, AssignUser } from '@/types'
import { CLOSED } from '@/services/Const'
import AssignTable from './component/AssignTable.vue'
import { useUserStore } from '@/stores/UserStore'
import router from '@/router'
import { useMessageStore } from '@/stores/MessageStore'
import { getInviService } from '@/services/CommonService'

const props = defineProps<{ inviid: string }>()

const currentInvi = (await getInviService(props.inviid)) ?? {}
//
let inviCountsS: InviCount[] = []
let dateInvisR: Invigilation[] = []
let timetablesR: Timetable[] = []
const usersS = storeToRefs(useUsersStore()).usersS
const userR = storeToRefs(useUserStore()).userS
const assignUsersR = ref<AssignUser>({})

// 当前分配的监考
let week = getInviWeek(currentInvi.date!)
let dayweek = getInviDayweek(currentInvi.date!)
const amountR = currentInvi.amount!

//
const allP = await Promise.all([
  // 当天课表
  listTimetablesService(week, dayweek),
  // 当天监考
  listDateInvisService(currentInvi.date!),
  // 监考数量
  listCountsService()
])

inviCountsS = allP[2] ?? []
dateInvisR = allP[1] ?? []
timetablesR = allP[0] ?? []

// 分别计算渲染
const groupUsers = ref<InviAssignUser[]>([])
const allUsers: User[] = [...toRaw(usersS.value)]
const closedUsersR = ref<User[]>([])
const confUsersR = ref<InviAssignUser[]>([])

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
    closedUsersR.value.push(allUsers[index])
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

  groupUsers.value.push({
    id: allUsers[index].id,
    name: allUsers[index].name,
    amount: am,
    timetables: tb,
    invis: invisTm
  })
}
groupUsers.value.sort((x, y) => x.amount! - y.amount!)

for (let index = 0; index < groupUsers.value.length; index++) {
  if (groupUsers.value[index].timetables) {
    const x = groupUsers.value[index].timetables!.find((tb) =>
      confTime(currentInvi.date!, currentInvi.time?.starttime!, tb.period!)
    )
    if (x) {
      confUsersR.value.push(groupUsers.value[index])
      groupUsers.value.splice(index, 1)
      index--
      continue
    }
  }

  if (groupUsers.value[index].invis?.length! > 0) {
    for (const invi of groupUsers.value[index].invis!) {
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
            const x = groupUsers.value.find((gu) => gu.id == ex.userId)
            if (x) {
              const ind = groupUsers.value.indexOf(x)
              confUsersR.value.push(groupUsers.value[ind])
              groupUsers.value.splice(ind, 1)
              index--
            }

            continue
          }
        }
      }
    }
  }
}

const WeekC = computed(() => (date: string) => getInviWeek(date))
const dayweekC = computed(() => (date: string) => getInviChineseDayweek(date))

//
const countInputs: HTMLInputElement[] = []
const selectedUsers = ref<InviAssignUser[]>([])

const handleChange = (user: InviAssignUser) => {
  if (selectedUsers.value.length < amountR) {
    selectedUsers.value.push(user)
    return
  }
  const index = selectedUsers.value.indexOf(user)
  selectedUsers.value.splice(index, 1)
}

const setInput = (el: HTMLInputElement) => {
  countInputs.push(el)
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
  assignUsersR.value.executor = []
  if (currentInvi.calendarId) {
    const userIds: string[] = []
    currentInvi.executor!.forEach((ex) => {
      const user = usersS.value.find((u) => u.id == ex.userId)
      user && userIds.push(user.dingUserId!)
    })
  }
  assignUsersR.value.allocator = stringInviTime({ id: userR.value.id, name: userR.value.name })

  selectedUsers.value.forEach((us) => {
    assignUsersR.value.executor?.push(stringInviTime({ id: us.id, name: us.name }))
  })

  addAssignUsersService(currentInvi.id!, assignUsersR.value).then(() => {
    const { messageS, closeF } = storeToRefs(useMessageStore())
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
      {{ currentInvi.date }} / 第{{ WeekC(currentInvi.date!) }}周 /
      {{ dayweekC(currentInvi.date!) }}/ {{ currentInvi.time?.starttime }} -
      {{ currentInvi.time?.endtime }} / {{ currentInvi.course!.teacherName }} /
      {{ currentInvi.course!.courseName }} /
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
      同一名教师可带研究生参加同一场监考，算2次监考。
      <br />
    </el-col>
  </el-row>

  <el-row class="my-row">
    <el-col :span="6">
      <el-tag type="success" size="large">建议</el-tag>
    </el-col>
    <el-col :span="8">
      <template v-if="currentInvi.executor?.length! > 0">
        当前监考人员：
        <template v-for="(exec, index) of currentInvi.executor" :key="index">
          {{ exec.userName }};
        </template>
      </template>
    </el-col>
    <el-col :span="2" :offset="8">
      <el-button type="success" :disabled="selectedUsers.length < amountR" @click="submitUsers">
        提交
      </el-button>
    </el-col>
    <el-col style="margin-bottom: 10px">
      <AssignTable :users="groupUsers">
        <template #userAssign="userAssign">
          <el-button
            style="width: 60px"
            :type="getDisabledC(userAssign.user!).type"
            :ref="setInput"
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
      <AssignTable :users="confUsersR">
        <template #userAssign="userAssign">
          <el-button
            style="width: 60px"
            :type="getDisabledC(userAssign.user!).type"
            :ref="setInput"
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
