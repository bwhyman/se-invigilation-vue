<script setup lang="ts">
import router from '@/router'
import { CommonService } from '@/services/CommonService'
import { ASSIGN } from '@/services/Const'
import { SubjectService } from '@/services/SubjectService'
import type { Invigilation, Page } from '@/types'
import InviTable from '@/views/main/component/InviTable.vue'

const inviS = ref<Invigilation[]>([])
const total = await SubjectService.getTotalsService(ASSIGN)

const pageR = ref<Page>({
  currentpage: 0,
  total: total,
  url: '/subject/assigned'
})
const route = useRoute()
let params: { page?: string }

watch(
  () => route.params,
  async () => {
    params = route.params
    if (params.page === undefined) return
    const cpage = params.page ? parseInt(params.page) : 1
    inviS.value = await SubjectService.listInvisService(ASSIGN, cpage)
    pageR.value.currentpage = cpage
  },
  { immediate: true }
)

const editF = (invi: Invigilation) => {
  CommonService.setCurrentInviService(invi)
  router.push(`/subject/assigns/${invi.id}`)
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <InviTable :invis="inviS" :page="pageR" :show-executor="true">
        <template #action="action">
          <el-button type="primary" @click="editF(action.invi)">分配</el-button>
        </template>
      </InviTable>
    </el-col>
  </el-row>
</template>
