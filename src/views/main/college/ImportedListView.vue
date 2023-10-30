<script setup lang="ts">
import router from '@/router'
import { listImportedService, updateInvisService } from '@/services/CollegeService'
import { DISPATCH } from '@/services/Const'
import { stringInviTime } from '@/services/Utils'
import { useMessageStore } from '@/stores/MessageStore'
import { useUserStore } from '@/stores/UserStore'
import type { Department, Invigilation, Page } from '@/types'
import InviTable from '@/views/main/component/InviTable.vue'
import DepartmentView from './DepartmentView.vue'
import { Edit } from '@element-plus/icons-vue'
import { useInvigilationsStore } from '@/stores/InvigilationsStore'

const inviS = await listImportedService()

const pageR = ref<Page>({
  currentpage: 1,
  total: inviS.length,
  url: '',
  noPage: true
})

const userStore = useUserStore()
//
const departmentR = ref<Department>()
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
        depId: departmentR.value?.id,
        departmentName: departmentR.value?.name
      }
    })
  })

  //
  updateInvisService(invis).then(() => {
    const { messageS, closeF } = storeToRefs(useMessageStore())
    messageS.value = '下发成功!'
    closeF.value = () => {
      router.push(`/college/noticedepartments/${departmentR.value?.id}`)
    }
  })
}

const departChange = (dep: Department) => {
  departmentR.value = dep!
}

const editF = (inviid: string) => {
  router.push(`/college/inviedit/${inviid}`)
  const invi = inviS.find((i) => i.id == inviid)
  useInvigilationsStore().currentInviS = invi
}

const assignF = (invi: Invigilation) => {
  if (invi.amount != 1) {
    storeToRefs(useMessageStore()).messageS.value = '只能为监考人数为1的监考直接分配'
    return
  }
  storeToRefs(useInvigilationsStore()).currentInviS.value = invi
  const depid = departmentR.value?.id
  const name = invi.course?.teacherName
  const inviid = invi.id
  router.push(`/college/assigns/${inviid}/departments/${depid}/names/${name}`)
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
        <InviTable :invis="inviS" :page="pageR" :show-executor="false">
          <template #top>
            <el-button
              type="success"
              :disabled="!departmentR || selectR.length == 0"
              @click="updateInvis">
              提交
            </el-button>
          </template>
          <template #action="action">
            <div style="display: flex; justify-content: space-between; align-items: center">
              <div style="text-align: left">
                <div>
                  <el-button
                    @click="selectF(action.invi)"
                    :type="buttonTypeC(action.invi.id!)"
                    style="margin-bottom: 5px">
                    下发
                  </el-button>
                </div>
                <div>
                  <el-button @click="assignF(action.invi)" type="warning" :disabled="!departmentR">
                    分配
                  </el-button>
                </div>
              </div>
              <el-button type="primary" :icon="Edit" circle @click="editF(action.invi.id!)" />
            </div>
          </template>
        </InviTable>
      </el-col>
    </el-row>
  </div>
</template>
