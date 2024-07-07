<script setup lang="ts">
import { SubjectService } from '@/services/SubjectService'

const counts = await SubjectService.listCountsService()
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <template v-for="(count, index) of counts" :key="index">
        <span style="margin-right: 5px">
          {{ count.name }}
        </span>
        <el-tag>{{ count.count }}</el-tag>
        ;
      </template>
    </el-col>
  </el-row>
</template>
