<script setup lang="ts">
import router from '@/router'
import { CollegeService } from '@/services/CollegeService'
import type { Department, Invigilation, Page } from '@/types'
import InviTable from '@/views/main/component/InviTable.vue'
import DepartmentView from './DepartmentView.vue'
import OpterationMenuView from './operations/OpterationMenuView.vue'
const inviS = ref<Invigilation[]>([])
const pageR = ref<Page>({
  currentpage: 1,
  total: 0,
  url: ''
})

const paramsR = ref({ depid: '', page: 1 })
const { data: depInvisR, suspense: s1 } = CollegeService.listDepatchedsService(
  toRef(() => paramsR.value.depid),
  toRef(() => paramsR.value.page),
  toRef(() => !!paramsR.value.depid)
)
const { data: totalR, suspense: s2 } = CollegeService.getDepatchedTotalService(
  toRef(() => paramsR.value.depid),
  toRef(() => !!paramsR.value.depid)
)
const route = useRoute()
watch(
  () => route.params,
  async () => {
    const params = route.params as { depid?: string; page?: string }
    if (!params.depid) return
    const cpage = params.page ? parseInt(params.page) : 1
    //
    paramsR.value = { depid: params.depid, page: cpage }
    await Promise.all([s1(), s2()])
    //
    inviS.value = depInvisR.value!
    pageR.value.total = totalR.value
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
