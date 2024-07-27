<script setup lang="ts">
import router from '@/router'
import { CollegeService } from '@/services/CollegeService'
import type { Department, Invigilation, Page } from '@/types'
import InviTable from '@/views/main/component/InviTable.vue'
import DepartmentView from './DepartmentView.vue'
import OpterationMenuView from './operations/OpterationMenuView.vue'
const inviS = ref<Invigilation[]>([])
const pageR = ref<Page>({
  currentpage: 0,
  total: 0,
  url: ''
})

const route = useRoute()
let params: { depid?: string; page?: string }
watch(
  () => route.params,
  async () => {
    params = route.params
    if (!params.depid) return
    const cpage = params.page ? parseInt(params.page) : 1
    const result = await Promise.all([
      CollegeService.listDepatchedsService(params.depid, cpage),
      CollegeService.getDepatchedTotalService(params.depid)
    ])
    inviS.value = result[0]
    const x = result[1]
    const depTotal = { id: params.depid, total: x }
    pageR.value.total = depTotal?.total
    pageR.value.currentpage = cpage
    pageR.value.url = `/college/dispatched/${params.depid}`
  },
  { immediate: true }
)

const departChange = (dep: Department) => {
  router.push(`/college/dispatched/${dep.id}`)
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
      <el-col>
        <InviTable :invis="inviS" :page="pageR" :show-executor="true">
          <template #action="action">
            <OpterationMenuView :invi="action.invi" />
          </template>
        </InviTable>
      </el-col>
    </el-row>
  </div>
</template>
