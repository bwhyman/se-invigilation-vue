<script setup lang="ts">
import router from '@/router'
import { CommonService } from '@/services/CommonService'
import {
  beNoticedC,
  bellTitleC,
  getInviChinesedayweekC,
  getInviWeekC,
  replaceTDateC
} from '@/services/Utils'
import type { Invigilation } from '@/types'
import DatesPick from '@/views/main/component/DatesPick.vue'
import InvisDetailsDate from '@/views/main/component/InvisDetailsDate.vue'
import TotalNumber from '@/views/main/component/TotalNumber.vue'
import { Bell, Message } from '@element-plus/icons-vue'
import { createDialog } from './remarks'

const UNDISPATCHED = 0
const UNASSIGNED = 1
const UNNOTICED = 2
const ALL = 3

//
const inviStatusR = ref(ALL)
// 保留不随状态改变的查询结果
let invis: Invigilation[]
const invisR = ref<Invigilation[]>([])
//
const datesVueRef = ref<{ dateRangeR: string[] }>()
const dateRangeR = ref<string[]>([])
watch(
  () => datesVueRef.value?.dateRangeR,
  async () => {
    if (!datesVueRef.value || !datesVueRef.value.dateRangeR) return
    dateRangeR.value = datesVueRef.value.dateRangeR
    // 渲染结果
    invis = await CommonService.listInvisByDateService(dateRangeR.value[0], dateRangeR.value[1])
    invisR.value = invis
  }
)

const WeekC = getInviWeekC()

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
      <el-row style="align-items: flex-end">
        <el-col :span="12">
          <DatesPick ref="datesVueRef" />
        </el-col>
        <el-col :span="12" style="margin-bottom: 20px; text-align: right">
          <el-button type="primary" @click="exportF" v-if="inviStatusR == ALL && invisR.length > 0">
            导出监考表格
          </el-button>
        </el-col>
      </el-row>
    </el-col>
    <el-col style="margin-bottom: 5px">
      <el-radio-group @change="invisStatusChangeF" v-model="inviStatusR">
        <el-radio-button :value="ALL">全部</el-radio-button>
        <el-radio-button :value="UNNOTICED">未通知</el-radio-button>
        <el-radio-button :value="UNASSIGNED">未分配</el-radio-button>
        <el-radio-button :value="UNDISPATCHED">未下发</el-radio-button>
      </el-radio-group>
    </el-col>
    <el-col>
      <TotalNumber :total="invisR.length" />
    </el-col>
    <el-col>
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
