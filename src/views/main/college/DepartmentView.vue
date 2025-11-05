<script setup lang="ts">
import { CollegeService } from '@/services/CollegeService'
import { CommonService } from '@/services/CommonService'
import type { Department } from '@/types'

const { data: departmentsS, suspense: s1 } = CollegeService.listOpenedDepartmentsService()
const { data: settingstore, suspense: s2 } = CommonService.listSettingsService()
await Promise.all([s1(), s2()])

const showAvgC = settingstore.value?.isShowavgC

const { data: depAvgMap } = CollegeService.listDepartmentAvgsService(showAvgC)

const props = defineProps<{ change: (depart: Department) => void }>()

const route = useRoute()
const depid = route.params.depid
const depidR = ref('')
if (depid) {
  depidR.value = depid as string
}

const changeF = () => {
  const depart = departmentsS.value!.find((d) => d.id == depidR.value)
  props.change(depart!)
}
</script>
<template>
  <el-radio-group @change="changeF" v-model="depidR">
    <el-radio-button size="large" v-for="(dep, index) of departmentsS" :key="index" :value="dep.id">
      {{ dep.name }}
      <template v-if="showAvgC">({{ depAvgMap?.get(dep.id!) ?? 0 }})</template>
    </el-radio-button>
  </el-radio-group>
</template>
