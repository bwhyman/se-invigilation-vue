<script setup lang="ts">
import { getDepatchedTotalService, listDepatchedsService } from '@/services/CollegeService'
import type { Department, Invigilation, Page } from '@/types'
import InviTable from '@/views/main/component/InviTable.vue'
import DepartmentView from './DepartmentView.vue'
import router from '@/router'
import { Edit } from '@element-plus/icons-vue'
import { useInvigilationsStore } from '@/stores/InvigilationsStore'
interface Props {
  depid?: string
  page?: string
}

const inviS = ref<Invigilation[]>([])
const pageR = ref<Page>({
  currentpage: 0,
  total: 0,
  url: ''
})

const departTotalsR: { id: string; total: number }[] = []
const route = useRoute()
watchEffect(async () => {
  const { depid, page } = route.params as Props
  if (!depid) return
  const cpage = page ? parseInt(page) : 1

  inviS.value = await listDepatchedsService(depid, cpage)
  let depTotal = departTotalsR.find((dep) => dep.id == depid)
  if (!depTotal) {
    const x = (await getDepatchedTotalService(depid)) ?? 1
    depTotal = { id: depid, total: x }
    departTotalsR.push(depTotal)
  }
  pageR.value.total = depTotal?.total
  pageR.value.currentpage = cpage
  pageR.value.url = `/college/dispatched/${depid}`
})

const departChange = (dep: Department) => {
  router.push(`/college/dispatched/${dep.id}`)
}

const editF = (inviid: string) => {
  router.push(`/college/inviedit/${inviid}`)
  const invi = inviS.value.find((i) => i.id == inviid)
  storeToRefs(useInvigilationsStore()).currentInviS.value = invi
}
</script>
<template>
  <div>
    <el-row class="my-row">
      <el-col>
        <DepartmentView :change="departChange" />
      </el-col>
    </el-row>
    <el-row class="my-row">
      <el-col style="margin-bottom: 10px">
        <InviTable :invis="inviS" :page="pageR" :show-executor="true">
          <template #action="action">
            <el-button type="primary" :icon="Edit" circle @click="editF(action.invi.id!)" />
          </template>
        </InviTable>
      </el-col>
    </el-row>
  </div>
</template>
