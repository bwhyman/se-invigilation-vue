<script setup lang="ts">
import router from '@/router'
import { DISPATCH } from '@/services/Const'
import { getTotalsService, listInvisService } from '@/services/SubjectService'
import { useInvigilationsStore } from '@/stores/InvigilationsStore'
import type { Invigilation } from '@/types'
import InviTable from '@/views/main/component/InviTable.vue'

const props = defineProps<{ page?: string }>()
const inviS = ref<Invigilation[]>([])
const total = await getTotalsService(DISPATCH)

const pageR = ref<{ currentpage?: number; total?: number; url?: string }>({
  currentpage: 0,
  total: total,
  url: '/subject/dispatched'
})

watch(
  props,
  async () => {
    const cpage = props.page ? parseInt(props.page) : 1
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
      <InviTable :invis="inviS" :page="pageR">
        <template #action="action">
          <el-button type="primary" @click="assignF(action.invi)">分配</el-button>
        </template>
      </InviTable>
    </el-col>
  </el-row>
</template>
