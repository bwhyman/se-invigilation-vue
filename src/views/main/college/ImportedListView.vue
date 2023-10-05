<script setup lang="ts">
import router from '@/router'
import { listImportedService, updateInvisService } from '@/services/CollegeService'
import { DISPATCH } from '@/services/Const'
import { stringInviTime } from '@/services/Utils'
import { useMessageStore } from '@/stores/MessageStore'
import { useUserStore } from '@/stores/UserStore'
import type { Invigilation } from '@/types'
import InviTable from '@/views/main/component/InviTable.vue'
import DepartmentView from './DepartmentView.vue'
import { useDepartmentsStore } from '@/stores/DepartmentStore'
import { Edit } from '@element-plus/icons-vue'
import { useInvigilationsStore } from '@/stores/InvigilationsStore'

const inviS = await listImportedService()

const pageR = ref<{ currentpage?: number; total?: number; url?: string }>({
  currentpage: 1,
  total: inviS.length,
  url: ''
})

const userStore = useUserStore()
const departmentsS = storeToRefs(useDepartmentsStore()).departments
//
const depIdR = ref('')
const selectR = ref<Invigilation[]>([])

const selectF = (invi: Invigilation) => {
  const inviT = selectR.value.find((i) => i.id == invi.id)
  if (!inviT) {
    selectR.value.push(invi)
    return
  }
  const index = selectR.value.indexOf(inviT)
  selectR.value.splice(index, 1)
}

const buttonTypeC = computed(() => (id: string) => {
  const inviT = selectR.value.find((i) => i.id == id)
  return inviT ? 'warning' : 'primary'
})

//
const updateInvis = () => {
  const invis: Invigilation[] = []
  selectR.value.forEach((invi) => {
    invis.push({
      id: invi.id!,
      status: DISPATCH,
      dispatcher: stringInviTime(userStore.userS),
      department: {
        depId: depIdR.value,
        departmentName: departmentsS.value.find((d) => d.id == depIdR.value)?.name
      }
    })
  })

  //
  updateInvisService(invis).then(() => {
    const { messageS, closeF } = storeToRefs(useMessageStore())
    messageS.value = '下发成功!'
    closeF.value = () => {
      router.push(`/college/notices/${depIdR.value}`)
    }
  })
}

const departChange = (depid: string) => {
  depIdR.value = depid
}

const editF = (inviid: string) => {
  router.push(`/college/inviedit/${inviid}`)
  const invi = inviS.find((i) => i.id == inviid)
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
      <el-col style="text-align: right">
        <el-button type="success" :disabled="!depIdR || selectR.length == 0" @click="updateInvis">
          提交
        </el-button>
      </el-col>
      <el-col>
        <InviTable :invis="inviS" :page="pageR">
          <template #action="action">
            <div style="display: flex; justify-content: space-between; align-items: center">
              <div>
                <el-button @click="selectF(action.invi)" :type="buttonTypeC(action.invi.id!)">
                  下发
                </el-button>
              </div>
              <el-button type="primary" :icon="Edit" circle @click="editF(action.invi.id!)" />
            </div>
          </template>
        </InviTable>
      </el-col>
    </el-row>
  </div>
</template>
