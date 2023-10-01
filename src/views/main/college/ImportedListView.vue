<script setup lang="ts">
import router from '@/router'
import {
  listCollegeInvigilationsService,
  listDepartmentsService,
  updateInvisService
} from '@/services/CollegeService'
import { DISPATCH, IMPORT } from '@/services/Const'
import { stringInviTime } from '@/services/Utils'
import { useMessageStore } from '@/stores/MessageStore'
import { useUserStore } from '@/stores/UserStore'
import type { Invigilation } from '@/types'
import InviTable from '@/views/main/component/InviTable.vue'

const results = await Promise.all([
  listDepartmentsService(),
  listCollegeInvigilationsService(IMPORT)
])

const departmentsS = results[0]
const inviS = results[1]

const userStore = useUserStore()

//
const selectDepIdsR = ref('')
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
  if (inviT) {
    return 'warning'
  }
  return 'primary'
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
        depId: selectDepIdsR.value,
        departmentName: departmentsS.find((d) => d.id == selectDepIdsR.value)?.name
      }
    })
  })
  updateInvisService(invis).then((r) => {
    const { messageS, closeF } = storeToRefs(useMessageStore())
    messageS.value = '下发成功!'
    closeF.value = () => {
      router.push(`/college/notices/${selectDepIdsR.value}`)
    }
  })
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <el-radio-group
        v-model="selectDepIdsR"
        class="ml-4"
        style="margin-bottom: 10px; margin-right: 10px">
        <el-radio-button
          size="large"
          v-for="(dep, index) of departmentsS"
          :key="index"
          :label="dep.id">
          {{ dep.name }}
        </el-radio-button>
      </el-radio-group>
    </el-col>
    <el-col style="text-align: right">
      <el-button
        type="success"
        :disabled="!selectDepIdsR || selectR.length == 0"
        @click="updateInvis">
        提交
      </el-button>
    </el-col>
    <el-col>
      <InviTable :invis="inviS">
        <template #action="action">
          <el-button @click="selectF(action.invi)" :type="buttonTypeC(action.invi.id!)">
            下发
          </el-button>
        </template>
      </InviTable>
    </el-col>
  </el-row>
</template>
