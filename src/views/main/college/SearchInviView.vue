<script setup lang="ts">
import { listInvisByDateService } from '@/services/CollegeService'
import { getSettingsService } from '@/services/CommonService'
import { getInviChineseDayweek, getInviWeek, replaceTDateC } from '@/services/Utils'
import { useSettingStore } from '@/stores/SettingStore'
import type { Invigilation } from '@/types'
import { Bell } from '@element-plus/icons-vue'

//
const dateRangeR = ref<Date[]>([])
const sDate = new Date()
const eDate = new Date(new Date().setDate(sDate.getDate() + 7))
dateRangeR.value[0] = sDate
dateRangeR.value[1] = eDate

const results = await Promise.all([
  getSettingsService(),
  listInvisByDateService(sDate.toISOString().substring(0, 10), eDate.toISOString().substring(0, 10))
])

const invis = results[1]
const invisR = ref<Invigilation[]>([])
const settingsStore = useSettingStore()

invisR.value = invis

const changeFixedRangeF = async () => {
  const sdate = dateRangeR.value[0].toISOString().substring(0, 10)
  const edate = dateRangeR.value[1].toISOString().substring(0, 10)
  invisR.value = await listInvisByDateService(sdate, edate)
}

const inviStatusR = ref(3)

const WeekC = computed(() => (date: string) => getInviWeek(date, settingsStore.getFirstWeek()))
const dayweekC = computed(() => (date: string) => getInviChineseDayweek(date))

//
const invisStatusChangeF = (val: number) => {
  // 已分配
  if (val == 2) {
    invisR.value = invis.filter((invi) => invi.executor)
  }
  // 全部
  if (val == 3) {
    invisR.value = invis
  }
  // 未分配
  if (val == 1) {
    const invisUns = [...invis.filter((invi) => !invi.executor)]
    invisUns.sort((x, y) => Number(x.department?.depId!) - Number(y.department?.depId!))
    invisR.value = invisUns
  }
}

const bellTitleC = computed(() => (invi: Invigilation) => `ID: ${invi.calendarId}`)
const beNoticed = computed(() => (exid: string, noticeIds: string[] = []) => {
  return noticeIds.indexOf(exid) != -1
})
</script>
<template>
  <el-row class="my-row">
    <el-col :span="8">
      <div class="demo-date-picker">
        <div class="block">
          <el-date-picker
            v-model="dateRangeR"
            type="daterange"
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            size="large" />
        </div>
      </div>
    </el-col>
    <el-col :span="2">
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
      </el-radio-group>
      <!--  -->
      <el-table :data="invisR">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column width="100">
          <template #default="scope">
            {{ scope.row.course.teacherName }}
          </template>
        </el-table-column>
        <el-table-column min-width="150">
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
            第 {{ WeekC(scope.row.date) }} 周 / {{ dayweekC(scope.row.date) }}
          </template>
        </el-table-column>
        <el-table-column>
          <template #default="scope">
            <template v-if="scope.row.course">
              {{ scope.row.course.location }}
            </template>
          </template>
        </el-table-column>
        <el-table-column v-if="inviStatusR == 1">
          <template #default="scope">
            <template v-if="scope.row.department">
              {{ scope.row.department.departmentName }}
            </template>
          </template>
        </el-table-column>

        <el-table-column v-if="inviStatusR != 1" width="120">
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
                  v-if="beNoticed(exeUser.userId, scope.row.noticeUserIds)"
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

.demo-date-picker .demonstration {
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-bottom: 20px;
}

table td {
  border-bottom: 1px solid #ebeef5;
}
</style>
