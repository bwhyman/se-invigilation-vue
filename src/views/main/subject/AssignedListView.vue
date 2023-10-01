<script setup lang="ts">
import InviTable from '@/views/main/component/InviTable.vue'
import { listInvisService } from '@/services/SubjectService'
import { ASSIGN } from '@/services/Const'
import { Edit } from '@element-plus/icons-vue'

const invis = await listInvisService(ASSIGN)
console.log(invis)

const router = useRouter()

const editF = (id: string) => {
  router.push(`/subject/assigns/${id}`)
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <InviTable :invis="invis">
        <template #action="action">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <span v-for="(exec, index) of action.invi.executor" :key="index">
                {{ exec.userName }}
                <br />
              </span>
            </div>
            <el-button type="primary" :icon="Edit" circle @click="editF(action.invi.id!)" />
          </div>
        </template>
      </InviTable>
    </el-col>
  </el-row>
</template>
