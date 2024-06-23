<script setup lang="ts">
import router from '@/router'
import { listImportedService, updateInvisService } from '@/services/CollegeService'
import { DISPATCH } from '@/services/Const'
import { stringInviTime } from '@/services/Utils'
import { useUserStore } from '@/stores/UserStore'
import type { Department, Invigilation, Page } from '@/types'
import InviTable from '@/views/main/component/InviTable.vue'
import DepartmentView from './DepartmentView.vue'
import OpterationMenuView from './operations/OpterationMenuView.vue'
import { createElNotificationSuccess } from '@/components/message'

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
const updateInvis = async () => {
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
  await updateInvisService(invis)
  createElNotificationSuccess('监考已下发')
  router.push(`/college/noticedepartments/${departmentR.value?.id}`)
}

const departChange = (dep: Department) => {
  departmentR.value = dep!
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
            <div
              style="
                display: flex;
                justify-content: space-around;
                align-items: center;
                margin: 3px 0;
              ">
              <el-button @click="selectF(action.invi)" :type="buttonTypeC(action.invi.id!)">
                下发
              </el-button>
              <OpterationMenuView :invi="action.invi" />
            </div>
          </template>
        </InviTable>
      </el-col>
    </el-row>
  </div>
</template>
