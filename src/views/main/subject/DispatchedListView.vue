<script setup lang="ts">
import router from '@/router'
import { SubjectService } from '@/services/SubjectService'
import type { Invigilation, Page } from '@/types'
import InviTable from '@/views/main/component/InviTable.vue'
const { data: inviS, suspense: suspDis } = SubjectService.listDispatchedsService()

await Promise.all([suspDis()])

const pageR = ref<Page>({
  currentpage: 1,
  total: inviS.value?.length,
  url: '/subject/dispatched',
  noPage: true
})

//
const assignF = (invi: Invigilation) => {
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
