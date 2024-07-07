<script setup lang="ts">
import router from '@/router'
import { CollegeService } from '@/services/CollegeService'
import { getSettingsService } from '@/services/CommonService'
import {
  getInviWeekC,
  getInviChinesedayweekC,
  replaceTDateC,
  bellTitleC,
  beNoticedC
} from '@/services/Utils'
import type { Invigilation } from '@/types'
import { Bell, Message } from '@element-plus/icons-vue'
import TotalNumber from '../component/TotalNumber.vue'
import { createDialog } from './remarks'
import InvisDetailsDate from './InvisDetailsDate.vue'

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
  CollegeService.listInvisByDateService(dateRangeR.value[0], dateRangeR.value[1])
])

let invis = results[1]
const invisR = ref<Invigilation[]>([])
const settingsStore = results[0]

invisR.value = invis

const changeFixedRangeF = async () => {
  const sdate = dateRangeR.value[0]
  const edate = dateRangeR.value[1]
  invis = await CollegeService.listInvisByDateService(sdate, edate)
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
const exportF = async () => {
  const { exportInvisDetailsDate } = await import('@/services/excel/Invis2Excel')
  exportInvisDetailsDate(aggInvisR.value, dateRangeR.value[0], dateRangeR.value[1])
}

// 将监考信息聚合为实际可用信息，用于导出表格或渲染
const aggInvisR = ref<Invigilation[]>([])
watch(
  invisR,
  () => {
    if (inviStatusR.value != ALL || invisR.value.length == 0) {
      return
    }
    aggInvisR.value = JSON.parse(JSON.stringify(invisR.value))
    for (const invisx of aggInvisR.value) {
      const invisSame = aggInvisR.value.filter(
        (i) =>
          i.date == invisx.date &&
          i.time?.starttime == invisx.time?.starttime &&
          i.course?.location == invisx.course?.location &&
          i != invisx
      )
      for (const i of invisSame) {
        i.executor && invisx.executor?.push(...i.executor)
        aggInvisR.value.splice(aggInvisR.value.indexOf(i), 1)
      }
    }
  },
  { immediate: true }
)

//
const remarkTypeC = computed(
  () => (invi: Invigilation) =>
    invi.remark ? { type: 'success', message: invi.remark } : { type: 'primary' }
)
//
const listSameInvis = (invi: Invigilation) => {
  const sameInvis = invisR.value.filter(
    (i) =>
      i.course?.courseName?.trim() == invi.course?.courseName?.trim() &&
      i.date == invi.date &&
      i.time?.starttime == invi.time?.starttime
  )
  createDialog(sameInvis)
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
      <el-button type="primary" @click="exportF" v-if="inviStatusR == ALL && invisR.length > 0">
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
              @click="listSameInvis(scope.row)" />
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
  <!--  -->
  <InvisDetailsDate :invis="aggInvisR" v-if="inviStatusR == ALL && invisR.length > 0" />
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
