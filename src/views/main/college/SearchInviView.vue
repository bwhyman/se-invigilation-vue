<script setup lang="ts">
import router from '@/router'
import { listInvisByDateService } from '@/services/CollegeService'
import { getSettingsService } from '@/services/CommonService'
import {
  getInviWeekC,
  getInviChinesedayweekC,
  replaceTDateC,
  bellTitleC,
  beNoticedC
} from '@/services/Utils'
import { useSettingStore } from '@/stores/SettingStore'
import type { Invigilation } from '@/types'
import { Bell, Message } from '@element-plus/icons-vue'
import TotalNumber from '../component/TotalNumber.vue'
import { useMessageStore } from '@/stores/MessageStore'
const SendRemark = defineAsyncComponent(() => import('./remarks/SendRemark.vue'))

const UNDISPATCHED = 0
const UNASSIGNED = 1
const UNNOTICED = 2
const ALL = 3

const formatDate = (date: Date) => {
  date.setHours(date.getHours() + 8)
  return date.toISOString().substring(0, 10)
}
//
const inviStatusR = ref(ALL)
//
const dateRangeR = ref<string[]>([])
// 默认+7天
const sDate = new Date()
const eDate = new Date()
eDate.setDate(eDate.getDate() + 7)
dateRangeR.value[0] = formatDate(sDate)
dateRangeR.value[1] = formatDate(eDate)

const results = await Promise.all([
  getSettingsService(),
  listInvisByDateService(dateRangeR.value[0], dateRangeR.value[1])
])

let invis = results[1]
const invisR = ref<Invigilation[]>([])
const settingsStore = useSettingStore()

invisR.value = invis

const changeFixedRangeF = async () => {
  const sdate = dateRangeR.value[0]
  const edate = dateRangeR.value[1]
  invis = await listInvisByDateService(sdate, edate)
  inviStatusR.value = ALL
  invisR.value = invis
}

const WeekC = getInviWeekC(settingsStore.getFirstWeek())

//
const invisStatusChangeF = (val: number) => {
  // 未通知
  if (val == UNNOTICED) {
    //  已分配
    const x = invis.filter((invi) => invi.executor)
    // 未通知
    invisR.value = x.filter(
      (invi) => !invi.noticeUserIds || invi.amount != invi.noticeUserIds.length
    )
    return
  }
  // 全部
  if (val == ALL) {
    invisR.value = invis
    return
  }
  // 已下发未分配，要过滤未下发
  if (val == UNASSIGNED) {
    const x = invis.filter((invi) => !invi.executor && invi.department)
    x.sort((x, y) => x.department?.depId!.localeCompare(y.department?.depId!, 'en')!)
    invisR.value = x
    return
  }
  // 未下发
  if (val == UNDISPATCHED) {
    invisR.value = invis.filter((invi) => !invi.department)
    return
  }
}

//
const noticeF = (depid: string) => {
  router.push(`/college/noticedepartments/${depid}`)
}

//
const sendRemarkR = ref(false)
const remarkInvisR = ref<Invigilation[]>([])
// 课程名称/日期/开始时间，完全相同，为同一门监考
const noticeRemarkF = (invi: Invigilation) => {
  remarkInvisR.value = invisR.value.filter(
    (i) =>
      i.course?.courseName?.trim() == invi.course?.courseName?.trim() &&
      i.date == invi.date &&
      i.time?.starttime == invi.time?.starttime
  )
  sendRemarkR.value = true
}
const closeRemarkF = (message: string) => {
  sendRemarkR.value = false
  if (message && message.length > 0) {
    const messageStore = useMessageStore()
    storeToRefs(messageStore).messageS.value = `备注通知发送成功。${message}`
    storeToRefs(messageStore).closeF.value = () => {
      router.go(0)
    }
  }
}

//
const remarkTypeC = computed(
  () => (invi: Invigilation) =>
    invi.remark ? { type: 'success', message: invi.remark } : { type: 'primary' }
)
//
const exportF = async () => {
  const { exportInvisDetailsDate } = await import('@/services/excel/Invis2Excel')
  exportInvisDetailsDate(invis, dateRangeR.value[0], dateRangeR.value[1])
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <div style="display: inline-block; margin-right: 10px">
        <div class="demo-date-picker">
          <div class="block">
            <el-date-picker
              value-format="YYYY-MM-DD"
              v-model="dateRangeR"
              type="daterange"
              range-separator="To"
              start-placeholder="Start date"
              end-placeholder="End date"
              size="large" />
          </div>
        </div>
      </div>

      <el-button type="success" :disabled="!(dateRangeR.length > 0)" @click="changeFixedRangeF">
        提交
      </el-button>
    </el-col>
    <el-col style="margin-top: 10px" :span="20">
      <el-radio-group
        @change="invisStatusChangeF"
        v-model="inviStatusR"
        style="margin-bottom: 10px">
        <el-radio-button :label="ALL">全部</el-radio-button>
        <el-radio-button :label="UNNOTICED">未通知</el-radio-button>
        <el-radio-button :label="UNASSIGNED">未分配</el-radio-button>
        <el-radio-button :label="UNDISPATCHED">未下发</el-radio-button>
      </el-radio-group>
    </el-col>
    <el-col :span="4" style="text-align: right">
      <el-button type="primary" @click="exportF" :disabled="invisR.length == 0">
        导出监考表格
      </el-button>
    </el-col>
    <el-col :span="4">
      <TotalNumber :total="invisR.length" />
    </el-col>
    <el-col>
      <!--  -->
      <el-table :data="invisR">
        <el-table-column type="index" label="" width="50" />
        <el-table-column width="100">
          <template #default="scope">
            {{ scope.row.course.teacherName }}
          </template>
        </el-table-column>
        <el-table-column min-width="120">
          <template #default="scope">
            {{ scope.row.course.courseName }}
            <br />
            {{ scope.row.course.clazz }}
          </template>
        </el-table-column>
        <el-table-column>
          <template #default="scope">
            {{ scope.row.date }}
            <br />
            第 {{ WeekC(scope.row.date) }} 周 / {{ getInviChinesedayweekC(scope.row.date) }}
            <br />
            {{ scope.row.time.starttime }} ~ {{ scope.row.time.endtime }}
          </template>
        </el-table-column>
        <el-table-column>
          <template #default="scope">
            <template v-if="scope.row.course">
              {{ scope.row.course.location }}
            </template>
          </template>
        </el-table-column>
        <el-table-column>
          <template #default="scope">
            {{ scope.row.department?.departmentName }}
          </template>
        </el-table-column>
        <el-table-column>
          <template #default="scope">
            <div v-if="scope.row.executor">
              <template v-for="(exeUser, index) of scope.row.executor" :key="index">
                <el-tag
                  size="large"
                  class="curor"
                  style="min-width: 60px"
                  :title="replaceTDateC(exeUser.time)">
                  {{ exeUser.userName }}
                </el-tag>
                <el-icon
                  :title="bellTitleC(scope.row)"
                  class="curor"
                  color="green"
                  size="large"
                  v-if="beNoticedC(exeUser.userId, scope.row.noticeUserIds)"
                  style="vertical-align: middle">
                  <Bell />
                </el-icon>
                <br />
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column width="80">
          <template #default="scope">
            <el-button
              v-if="inviStatusR == ALL"
              :title="remarkTypeC(scope.row).message"
              :type="remarkTypeC(scope.row).type"
              :icon="Message"
              circle
              @click="noticeRemarkF(scope.row)" />
            <el-button
              v-if="inviStatusR == UNASSIGNED"
              type="primary"
              :icon="Bell"
              circle
              @click="noticeF(scope.row.department?.depId)" />
          </template>
        </el-table-column>
      </el-table>
    </el-col>
  </el-row>
  <SendRemark v-if="sendRemarkR" :invis="remarkInvisR" :close="closeRemarkF" />
</template>
<style scoped>
.demo-date-picker {
  display: flex;
  width: 100%;
  padding: 0;
  flex-wrap: wrap;
}

.demo-date-picker .block {
  text-align: center;
  border-right: solid 1px var(--el-border-color);
  flex: 1;
}

.demo-date-picker .block:last-child {
  border-right: none;
}
</style>
