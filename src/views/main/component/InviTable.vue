<script setup lang="ts">
import router from '@/router'
import { getSettingsService } from '@/services/CommonService'
import { getInviChineseDayweek, getInviWeek } from '@/services/Utils'
import { useSettingStore } from '@/stores/SettingStore'
import type { Invigilation } from '@/types'
import { Bell } from '@element-plus/icons-vue'

await getSettingsService()

const settingsStore = useSettingStore()

// 表格全局每页显示个数
const PAGESIZE = 40

interface Props {
  invis: Invigilation[]
  page?: { currentpage?: number; total?: number; url?: string }
}
const props = defineProps<Props>()

const WeekC = computed(() => (date: string) => getInviWeek(date, settingsStore.getFirstWeek()))
const dayweekC = computed(() => (date: string) => getInviChineseDayweek(date))

const changePage = (n: number) => {
  if (n == 1) {
    router.push(`${props.page!.url!}`)
    return
  }
  router.push(`${props.page!.url!}/${n}`)
}

const beNoticed = computed(() => (exid: string, noticeIds: string[]) => {
  return noticeIds.indexOf(exid) != -1
})

const bellTitleC = computed(
  () => (invi: Invigilation) => `ID: ${invi.calendarId}\n${invi.updateTime?.replace('T', ' ')}`
)
</script>
<template>
  <el-table :data="props.invis" style="margin-bottom: 10px">
    <el-table-column type="index" label="#" width="50" />
    <el-table-column>
      <template #default="scope">
        {{ scope.row.course.teacherName }}
        <br />
        {{ scope.row.course.courseName }}
        <br />
        {{ scope.row.course.clazz }}
      </template>
    </el-table-column>
    <el-table-column>
      <template #default="scope">
        {{ scope.row.date }}
        <br />
        第 {{ WeekC(scope.row.date) }} 周 / {{ dayweekC(scope.row.date) }}
        <br />
        {{ scope.row.time.starttime }} -
        {{ scope.row.time.endtime }}
      </template>
    </el-table-column>
    <el-table-column>
      <template #default="scope">
        {{ scope.row.course.location }}
        <br />
        <el-tag>{{ scope.row.amount }}</el-tag>
        人
      </template>
    </el-table-column>
    <el-table-column width="250">
      <template #default="scope">
        <template v-if="scope.row.department">
          部门：
          <el-tag>{{ scope.row.department.departmentName }}</el-tag>
          <br />
        </template>
        <template v-if="scope.row.importer">
          导入：
          <el-tag>{{ scope.row.importer.userName }}</el-tag>
          <br />
        </template>
        <template v-if="scope.row.dispatcher">
          下发：
          <el-tag>{{ scope.row.dispatcher.userName }}</el-tag>
          <br />
        </template>
        <template v-if="scope.row.allocator">
          分配：
          <el-tag>{{ scope.row.allocator.userName }}</el-tag>
          <br />
        </template>
      </template>
    </el-table-column>
    <el-table-column>
      <template #default="scope">
        <div v-if="scope.row.executor">
          <template v-for="(exeUser, index) of scope.row.executor" :key="index">
            <el-tag size="large">
              {{ exeUser.userName }}
            </el-tag>
            <el-icon
              :title="bellTitleC(scope.row)"
              color="green"
              size="large"
              v-if="beNoticed(exeUser.userId, scope.row.noticeUserIds ?? [])"
              style="vertical-align: middle">
              <Bell />
            </el-icon>
            <br />
          </template>
        </div>
      </template>
    </el-table-column>
    <el-table-column min-width="60">
      <template #default="scope">
        <div style="text-align: right">
          <slot name="action" :invi="scope.row as Invigilation"></slot>
        </div>
      </template>
    </el-table-column>
  </el-table>
  <el-row>
    <el-col :span="2">
      <span v-if="props.page?.total != 0">
        共
        <el-tag>{{ props.page?.total! }}</el-tag>
        项
      </span>
    </el-col>
    <el-col :span="10">
      <el-pagination
        background
        :current-page="props.page?.currentpage"
        layout="prev, pager, next"
        @update:current-page="changePage"
        :default-page-size="PAGESIZE"
        :total="props.page?.total!" />
    </el-col>
  </el-row>
</template>
