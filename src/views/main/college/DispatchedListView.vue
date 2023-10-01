<script setup lang="ts">
import { listCollegeInvigilationsService } from '@/services/CollegeService'
import { DISPATCH } from '@/services/Const'
import InviTable from '@/views/main/component/InviTable.vue'

const inviS = await listCollegeInvigilationsService(DISPATCH)
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <InviTable :invis="inviS" />
    </el-col>
  </el-row>
</template>
