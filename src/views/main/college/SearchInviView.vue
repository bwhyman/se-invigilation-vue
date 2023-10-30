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
import { Bell } from '@element-plus/icons-vue'

const UNDISPATCHED = 0
const UNASSIGNED = 1
const ASSIGNED = 2
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
  // 已分配
  if (val == ASSIGNED) {
    invisR.value = invis.filter((invi) => invi.executor)
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
    const invisUns = [...x]
    invisUns.sort((x, y) => x.department?.depId!.localeCompare(y.department?.depId!, 'en')!)
    invisR.value = invisUns
    return
  }
  // 未下发
  if (val == UNDISPATCHED) {
    const x = invis.filter((invi) => !invi.department)
    const invisUns = [...x]
    invisR.value = invisUns
    return
  }
}

//
const noticeF = (depid: string) => {
  router.push(`/college/noticedepartments/${depid}`)
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
    <el-col style="margin-top: 10px">
      <el-radio-group
        @change="invisStatusChangeF"
        v-model="inviStatusR"
        style="margin-bottom: 10px">
        <el-radio-button label="3">全部</el-radio-button>
        <el-radio-button label="2">已分配</el-radio-button>
        <el-radio-button label="1">已下发未分配</el-radio-button>
        <el-radio-button label="0">未下发</el-radio-button>
      </el-radio-group>
    </el-col>
    <el-col :span="2">
      <span>
        共
        <el-tag>{{ invisR.length }}</el-tag>
        项
      </span>
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
        <el-table-column min-width="130">
          <template #default="scope">
            {{ scope.row.course.courseName }}
            <br />
            {{ scope.row.course.clazz }}
          </template>
        </el-table-column>
        <el-table-column>
          <template #default="scope">
            {{ scope.row.date }} {{ scope.row.time.starttime }}~{{ scope.row.time.endtime }}
            <br />
            第 {{ WeekC(scope.row.date) }} 周 / {{ getInviChinesedayweekC(scope.row.date) }}
          </template>
        </el-table-column>
        <el-table-column width="120">
          <template #default="scope">
            <template v-if="scope.row.course">
              {{ scope.row.course.location }}
            </template>
          </template>
        </el-table-column>
        <el-table-column v-if="inviStatusR == UNASSIGNED">
          <template #default="scope">
            <el-row>
              <el-col :span="20">{{ scope.row.department?.departmentName }}</el-col>
              <el-col :span="2">
                <el-button
                  :span="2"
                  type="primary"
                  :icon="Bell"
                  circle
                  @click="noticeF(scope.row.department?.depId)" />
              </el-col>
            </el-row>
          </template>
        </el-table-column>

        <el-table-column v-if="inviStatusR != UNASSIGNED" width="120">
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
      </el-table>
    </el-col>
  </el-row>
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
