<script setup lang="ts">
const formatDate = (date: Date) => {
  date.setHours(date.getHours() + 8)
  return date.toISOString().substring(0, 10)
}
const dateRangeR = ref<string[]>([])
// 默认+7天
const sDate = new Date()
const eDate = new Date()
eDate.setDate(eDate.getDate() + 7)
dateRangeR.value[0] = formatDate(sDate)
dateRangeR.value[1] = formatDate(eDate)

defineExpose({ dateRangeR })
</script>
<template>
  <div style="display: inline-block; margin-right: 10px">
    <p style="margin-bottom: 10px">
      打开日历面板，单击日历日期确定开始日期，再次单击确定截至日期。
    </p>
    <div class="demo-date-picker" style="display: inline-block; margin-right: 10px">
      <div class="block">
        <el-date-picker
          value-format="YYYY-MM-DD"
          v-model="dateRangeR"
          type="daterange"
          range-separator="To"
          start-placeholder="Start date"
          end-placeholder="End date"
          size="large" />
      </div>
    </div>
  </div>
</template>
