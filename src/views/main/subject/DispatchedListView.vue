<script setup lang="ts">
import { DISPATCH } from '@/services/Const'
import { listInvisService } from '@/services/SubjectService'
import { useInvigilationsStore } from '@/stores/InvigilationsStore'
import type { Invigilation } from '@/types'
import InviTable from '@/views/main/component/InviTable.vue'

const invis = (await listInvisService(DISPATCH)) ?? []
//
const router = useRouter()
const assignF = (invi: Invigilation) => {
  storeToRefs(useInvigilationsStore()).currentInviS.value = invi
  router.push(`/subject/assigns/${invi.id}`)
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <InviTable :invis="invis">
        <template #action="action">
          <el-button type="primary" @click="assignF(action.invi)">分配</el-button>
        </template>
      </InviTable>
    </el-col>
  </el-row>
</template>
