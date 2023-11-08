<script setup lang="ts">
import InviTable from '@/views/main/component/InviTable.vue'
import { getTotalsService, listInvisService } from '@/services/SubjectService'
import { ASSIGN } from '@/services/Const'
import { Edit } from '@element-plus/icons-vue'
import type { Invigilation, Page } from '@/types'
import router from '@/router'
import { useInvigilationsStore } from '@/stores/InvigilationsStore'
defineProps<{ page?: string }>()
const inviS = ref<Invigilation[]>([])
const total = await getTotalsService(ASSIGN)

const pageR = ref<Page>({
  currentpage: 0,
  total: total,
  url: '/subject/assigned'
})
const route = useRoute()

watchEffect(async () => {
  const { page } = route.params as { page: string }
  const cpage = page ? parseInt(page) : 1
  inviS.value = await listInvisService(ASSIGN, cpage)
  pageR.value.currentpage = cpage
})

const editF = (invi: Invigilation) => {
  useInvigilationsStore().currentInviS = invi
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
