<script setup lang="ts">
import router from '@/router'
import { DISPATCH } from '@/services/Const'
import { getTotalsService, listInvisService } from '@/services/SubjectService'
import { useInvigilationsStore } from '@/stores/InvigilationsStore'
import type { Invigilation, Page } from '@/types'
import InviTable from '@/views/main/component/InviTable.vue'

const route = useRoute()
let params: { page?: string }
const inviS = ref<Invigilation[]>([])
const total = await getTotalsService(DISPATCH)

const pageR = ref<Page>({
  currentpage: 0,
  total: total,
  url: '/subject/dispatched'
})

watch(
  route,
  async () => {
    params = route.params
    const cpage = params.page ? parseInt(params.page) : 1
    inviS.value = await listInvisService(DISPATCH, cpage)
    pageR.value.currentpage = cpage
  },
  { immediate: true }
)

//
const assignF = (invi: Invigilation) => {
  useInvigilationsStore().currentInviS = invi
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
