<script setup lang="ts">
import router from '@/router'
import { getInviChineseDayweek, getInviWeek, replaceTDate } from '@/services/Utils'
import type { Invigilation, Operator, Page } from '@/types'
import { Bell } from '@element-plus/icons-vue'
import TotalNumber from './TotalNumber.vue'

interface Props {
  invis: Invigilation[]
  page?: Page
  showExecutor?: boolean
}
const props = withDefaults(defineProps<Props>(), { invis: () => [] })

// 表格全局每页显示个数
let PAGESIZE = 20
if (props.page?.noPage) {
  PAGESIZE = props.page?.total! + 1
}

const changePageF = (n: number) => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  const url = props.page!.url!
  const path = n > 1 ? `${url}/${n}` : url
  router.push(path)
}
</script>
<template>
  <el-row>
    <el-col :span="2">
      <TotalNumber :total="props.page?.total!" />
    </el-col>
    <el-col :span="20">
      <el-pagination
        :hide-on-single-page="true"
        background
        :current-page="props.page?.currentpage"
        layout="prev, pager, next"
        @update:current-page="changePageF"
        :page-size="PAGESIZE"
        :total="props.page?.total!" />
    </el-col>
    <el-col :span="2"><slot name="top"></slot></el-col>
  </el-row>
  <el-table :data="props.invis" style="margin-bottom: 10px">
    <el-table-column type="index" label="" width="50" />
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
        第 {{ getInviWeek(scope.row.date) }} 周 / {{ getInviChineseDayweek(scope.row.date) }}
        <br />
        {{ scope.row.time.starttime }} ~
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
          录入：
          <el-tag class="curor" :title="replaceTDate(scope.row.importer.time)">
            {{ scope.row.importer.userName }}
          </el-tag>
          <br />
        </template>
        <template v-if="scope.row.dispatcher">
          下发：
          <el-tag class="curor" :title="replaceTDate(scope.row.dispatcher.time)">
            {{ scope.row.dispatcher.userName }}
          </el-tag>
          <br />
        </template>
        <template v-if="scope.row.allocator">
          分配：
          <el-tag class="curor" :title="replaceTDate(scope.row.allocator.time)">
            {{ scope.row.allocator.userName }}
          </el-tag>
          <br />
        </template>
      </template>
    </el-table-column>
    <el-table-column v-if="props.showExecutor">
      <template #default="scope">
        <div v-if="scope.row.executor">
          <template v-for="(exeUser, index) of scope.row.executor as Operator[]" :key="index">
            <el-tag
              size="large"
              class="curor"
              style="min-width: 60px"
              :title="replaceTDate(exeUser.time)">
              {{ exeUser.userName }}
            </el-tag>
            <el-icon
              class="curor"
              color="green"
              size="large"
              :title="(scope.row as Invigilation).dingNotice?.calendars?.[index]?.eventId ?? ''"
              v-if="(scope.row as Invigilation).dingNotice?.userIds?.includes(exeUser.userId)"
              style="vertical-align: middle">
              <Bell />
            </el-icon>
            <br />
          </template>
        </div>
      </template>
    </el-table-column>
    <el-table-column min-width="80">
      <template #default="scope">
        <div>
          <slot name="action" :invi="scope.row as Invigilation"></slot>
        </div>
      </template>
    </el-table-column>
  </el-table>
  <el-row v-if="props.page?.total! > 0">
    <el-col :span="2">
      <TotalNumber :total="props.page?.total!" />
    </el-col>
    <el-col :span="10">
      <el-pagination
        :hide-on-single-page="true"
        background
        :current-page="props.page?.currentpage"
        layout="prev, pager, next"
        @update:current-page="changePageF"
        :page-size="PAGESIZE"
        :total="props.page?.total!" />
    </el-col>
  </el-row>
</template>
<style scoped>
.curor {
  cursor: pointer;
}
</style>
