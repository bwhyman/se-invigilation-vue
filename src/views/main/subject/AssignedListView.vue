<script setup lang="ts">
import InviTable from '@/views/main/component/InviTable.vue'
import { getTotalsService, listInvisService } from '@/services/SubjectService'
import { ASSIGN } from '@/services/Const'
import { Edit } from '@element-plus/icons-vue'
import type { Invigilation } from '@/types'
import router from '@/router'

const props = defineProps<{ page?: string }>()
const inviS = ref<Invigilation[]>([])
const total = await getTotalsService(ASSIGN)

const pageR = ref<{ currentpage?: number; total?: number; url?: string }>({
  currentpage: 0,
  total: total,
  url: '/subject/assigned'
})

watch(
  props,
  async () => {
    const cpage = props.page ? parseInt(props.page) : 1
    inviS.value = await listInvisService(ASSIGN, cpage)
    pageR.value.currentpage = cpage
  },
  { immediate: true }
)

const editF = (id: string) => {
  router.push(`/subject/assigns/${id}`)
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <InviTable :invis="inviS" :page="pageR">
        <template #action="action">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <el-tag v-for="(invi, index) of action.invi.executor" :key="index">
                {{ invi.userName }}
              </el-tag>
            </div>
            <el-button type="primary" :icon="Edit" circle @click="editF(action.invi.id!)" />
          </div>
        </template>
      </InviTable>
    </el-col>
  </el-row>
</template>
