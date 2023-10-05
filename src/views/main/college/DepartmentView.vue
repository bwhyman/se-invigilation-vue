<script setup lang="ts">
import { listOpenedDepartmentsService } from '@/services/CollegeService'

const departments = await listOpenedDepartmentsService()
const props = defineProps<{ change: (depid: string) => void }>()

const router = useRouter()
const depid = router.currentRoute.value.params.depid
const depidR = ref('')
if (depid) {
  depidR.value = depid as string
}
</script>
<template>
  <el-radio-group
    @change="props.change"
    v-model="depidR"
    class="ml-4"
    style="margin-bottom: 10px; margin-right: 10px">
    <el-radio-button size="large" v-for="(dep, index) of departments" :key="index" :label="dep.id">
      {{ dep.name }}
    </el-radio-button>
  </el-radio-group>
</template>
