<script setup lang="ts">
import router from '@/router'
import { CommonService } from '@/services/CommonService'
import { DISPATCH } from '@/services/Const'
import { SubjectService } from '@/services/SubjectService'
import type { Invigilation, Page } from '@/types'
import InviTable from '@/views/main/component/InviTable.vue'

const result = await Promise.all([
  SubjectService.getTotalsService(DISPATCH),
  SubjectService.listDispatchedsService(DISPATCH)
])
const inviS = result[1]
const total = result[0]
const pageR = ref<Page>({
  currentpage: 1,
  total: total,
  url: '/subject/dispatched',
  noPage: true
})

//
const assignF = (invi: Invigilation) => {
  CommonService.setCurrentInviService(invi)
  router.push(`/subject/assigns/${invi.id}`)
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <InviTable :invis="inviS" :page="pageR" :show-executor="false">
        <template #action="action">
          <el-button type="primary" @click="assignF(action.invi)">分配</el-button>
        </template>
      </InviTable>
    </el-col>
  </el-row>
</template>
