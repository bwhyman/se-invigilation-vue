<script setup lang="ts">
import InviTable from '@/views/main/component/InviTable.vue'
import { SubjectService } from '@/services/SubjectService'
import { ASSIGN } from '@/services/Const'
import { Edit } from '@element-plus/icons-vue'
import type { Invigilation, Page } from '@/types'
import router from '@/router'
import { setCurrentInviService } from '@/services/CommonService'

const inviS = ref<Invigilation[]>([])
const total = await SubjectService.getTotalsService(ASSIGN)

const pageR = ref<Page>({
  currentpage: 0,
  total: total,
  url: '/subject/assigned'
})
const route = useRoute()
let params: { page?: string }
watchEffect(async () => {
  params = route.params
  const cpage = params.page ? parseInt(params.page) : 1
  inviS.value = await SubjectService.listInvisService(ASSIGN, cpage)
  pageR.value.currentpage = cpage
})

const editF = (invi: Invigilation) => {
  setCurrentInviService(invi)
  router.push(`/subject/assigns/${invi.id}`)
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <InviTable :invis="inviS" :page="pageR" :show-executor="true">
        <template #action="action">
          <el-button type="primary" :icon="Edit" circle @click="editF(action.invi)" />
        </template>
      </InviTable>
    </el-col>
  </el-row>
</template>
