<script setup lang="ts">
import { CommonService } from '@/services/CommonService'
import type { Invigilation } from '@/types'
import DatesPick from '@/views/main/component/DatesPick.vue'
import InvisDetailsDate from '@/views/main/component/InvisDetailsDate.vue'

const invisR = ref<Invigilation[]>([])
//
const datesVueRef = ref<{ dateRangeR: string[] }>()
const dateRangeR = ref<string[]>([])
watch(
  () => datesVueRef.value?.dateRangeR,
  async () => {
    if (!datesVueRef.value || !datesVueRef.value.dateRangeR) return
    dateRangeR.value = datesVueRef.value.dateRangeR
    // 渲染结果
    invisR.value = await CommonService.listInvisByDateService(
      dateRangeR.value[0],
      dateRangeR.value[1]
    )
  }
)
const exportF = async () => {
  const { exportInvisDetailsDate } = await import('@/services/excel/Invis2Excel')
  exportInvisDetailsDate(invisR.value, dateRangeR.value[0], dateRangeR.value[1])
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <p>用于检索指定日期内所有专业监考，默认8日。紧凑模式，用于截图提醒教师监考等。</p>
    </el-col>
    <el-col></el-col>
    <el-col>
      <el-row style="align-items: flex-end">
        <el-col :span="12"><DatesPick ref="datesVueRef" /></el-col>
        <el-col :span="12" style="margin-bottom: 20px; text-align: right">
          <el-button type="primary" @click="exportF" v-if="invisR.length > 0">
            导出监考表格
          </el-button>
        </el-col>
      </el-row>
    </el-col>
    <el-col>
      <InvisDetailsDate :invis="invisR" />
    </el-col>
  </el-row>
</template>
