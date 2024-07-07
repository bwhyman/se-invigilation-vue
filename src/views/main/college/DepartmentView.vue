<script setup lang="ts">
import { CollegeService } from '@/services/CollegeService'
import type { Department } from '@/types'

const departmentsS = await CollegeService.listOpenedDepartmentsService()
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
  <el-radio-group
    @change="changeF"
    v-model="depidR"
    class="ml-4"
    style="margin-bottom: 10px; margin-right: 10px">
    <el-radio-button size="large" v-for="(dep, index) of departmentsS" :key="index" :label="dep.id">
      {{ dep.name }}
    </el-radio-button>
  </el-radio-group>
</template>
