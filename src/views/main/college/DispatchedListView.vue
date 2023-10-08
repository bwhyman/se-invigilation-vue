<script setup lang="ts">
import { getDepatchedTotalService, listDepatchedsService } from '@/services/CollegeService'
import type { Department, Invigilation } from '@/types'
import InviTable from '@/views/main/component/InviTable.vue'
import DepartmentView from './DepartmentView.vue'
import router from '@/router'
import { Edit } from '@element-plus/icons-vue'
import { useInvigilationsStore } from '@/stores/InvigilationsStore'

const props = defineProps<{ depid: string; page?: string }>()
const inviS = ref<Invigilation[]>([])
const pageR = ref<{ currentpage?: number; total?: number; url?: string }>({
  currentpage: 0,
  total: 0,
  url: ''
})

const departTotalsR: { id: string; total: number }[] = []

watch(
  props,
  async () => {
    if (!props.depid) return
    const cpage = props.page ? parseInt(props.page) : 1

    inviS.value = await listDepatchedsService(props.depid, cpage)
    let depTotal = departTotalsR.find((dep) => dep.id == props.depid)
    if (!depTotal) {
      const x = (await getDepatchedTotalService(props.depid)) ?? 1
      depTotal = { id: props.depid, total: x }
      departTotalsR.push(depTotal)
    }
    pageR.value.total = depTotal?.total
    pageR.value.currentpage = cpage
    pageR.value.url = `/college/dispatched/${props.depid}`
  },
  { immediate: true }
)

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
        <InviTable :invis="inviS" :page="pageR">
          <template #action="action">
            <div style="display: flex; justify-content: space-between; align-items: center">
              <div>
                <template v-for="(invi, index) of action.invi.executor" :key="index">
                  <el-tag>
                    {{ invi.userName }}
                  </el-tag>
                  <br />
                </template>
              </div>
              <el-button type="primary" :icon="Edit" circle @click="editF(action.invi.id!)" />
            </div>
          </template>
        </InviTable>
      </el-col>
    </el-row>
  </div>
</template>
