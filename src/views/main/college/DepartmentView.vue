<script setup lang="ts">
import { CollegeService } from '@/services/CollegeService'
import { SETTING_SHOWAVG } from '@/services/Const'
import type { Department } from '@/types'

const result = await Promise.all([
  CollegeService.listOpenedDepartmentsService(),
  CollegeService.listDepartmentAvgsService(),
  CollegeService.listSettingsService()
])
const departmentsS = result[0]
const avgInfos = result[1]
const settingsS = result[2]
const showAvgC = computed(
  () =>
    settingsS.value?.find((set) => set.skey == SETTING_SHOWAVG.name)?.svalue ===
    SETTING_SHOWAVG.value
)

const props = defineProps<{ change: (depart: Department) => void }>()

const route = useRoute()
const depid = route.params.depid
const depidR = ref('')
if (depid) {
  depidR.value = depid as string
}

const changeF = () => {
  const depart = departmentsS.value.find((d) => d.id == depidR.value)
  props.change(depart!)
}
</script>
<template>
  <el-radio-group @change="changeF" v-model="depidR">
    <el-radio-button size="large" v-for="(dep, index) of departmentsS" :key="index" :value="dep.id">
      {{ dep.name }}
      <template v-if="showAvgC">({{ avgInfos.get(dep.id!) ?? 0 }})</template>
    </el-radio-button>
  </el-radio-group>
</template>
