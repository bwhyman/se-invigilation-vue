<script setup lang="ts">
import router from '@/router'
import { ASSIGN } from '@/services/Const'
import { SubjectService } from '@/services/SubjectService'
import type { Invigilation, Page } from '@/types'
import InviTable from '@/views/main/component/InviTable.vue'

const { data: totalR, suspense } = SubjectService.getTotalsService(ASSIGN)
await suspense()
const pageR = ref<Page>({
  currentpage: 1,
  total: totalR.value,
  url: '/subject/assigned'
})
const { data: invisR } = SubjectService.listAssignedsService(
  computed(() => pageR.value.currentpage!)
)

const route = useRoute()
watch(
  () => route.params,
  () => {
    let params = route.params
    if (params.page === undefined) return
    const cpage = params.page ? parseInt(params.page as string) : 1
    pageR.value.currentpage = cpage
  },
  { immediate: true }
)

const editF = (invi: Invigilation) => {
  router.push(`/subject/assigns/${invi.id}`)
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <InviTable :invis="invisR" :page="pageR" :show-executor="true">
        <template #action="action">
          <el-button type="primary" @click="editF(action.invi)">分配</el-button>
        </template>
      </InviTable>
    </el-col>
  </el-row>
</template>
