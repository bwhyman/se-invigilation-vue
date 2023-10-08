<script setup lang="ts">
import router from '@/router'
import { getInviChineseDayweek, getInviWeek } from '@/services/Utils'
import type { Invigilation } from '@/types'

// 表格全局每页显示个数
const PAGESIZE = 40

interface Props {
  invis: Invigilation[]
  page?: { currentpage?: number; total?: number; url?: string }
}
const props = defineProps<Props>()

const WeekC = computed(() => (date: string) => getInviWeek(date))
const dayweekC = computed(() => (date: string) => getInviChineseDayweek(date))

const changePage = (n: number) => {
  if (n == 1) {
    router.push(`${props.page!.url!}`)
    return
  }
  router.push(`${props.page!.url!}/${n}`)
}
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
    <el-table-column min-width="60">
      <template #default="scope">
        <slot name="action" :invi="scope.row as Invigilation"></slot>
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
