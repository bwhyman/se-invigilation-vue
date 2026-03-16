<script setup lang="ts">
import { createElLoading } from '@/components/loading'
import { CommonService } from '@/services/CommonService'
import { SubjectService } from '@/services/SubjectService'
import type { Invigilation } from '@/types'
import DatesPick from '@/views/main/component/DatesPick.vue'
import InvisDetailsDate from '@/views/main/component/InvisDetailsDate.vue'

const exportOptionR = ref()
const exportOptions = [
  { id: 1, name: '当前时段' },
  { id: 2, name: '全部监考' }
]
//
const datesVueRef = ref<{ dateRangeR: string[] }>()
const dateRangeR = ref<string[]>([])

// 需要添加`外院系教师`，不能是只读的
const invisR = ref<Invigilation[]>([])
const { data, suspense } = CommonService.listInvisByDateService(
  toRef(() => dateRangeR.value[0]),
  toRef(() => dateRangeR.value[1]),
  toRef(() => dateRangeR.value.length > 0)
)
watch(
  () => datesVueRef.value?.dateRangeR,
  async () => {
    if (!datesVueRef.value || !datesVueRef.value.dateRangeR) return
    dateRangeR.value = datesVueRef.value.dateRangeR
    await suspense()
    invisR.value = toRaw(data.value!)
  }
)

const { data: inviAllR } = SubjectService.listDepartInvisAllService(
  computed(() => exportOptionR.value === 2)
)
//
const selectF = async () => {
  if (invisR.value?.length == 0) {
    throw '预导出监考数据为空'
  }
  const loading = createElLoading()
  const { exportInvisDetailsDate } = await import('@/services/excel/Invis2Excel')
  if (exportOptionR.value === 1) {
    exportInvisDetailsDate(invisR.value!, dateRangeR.value[0], dateRangeR.value[1])
  } else if (exportOptionR.value === 2) {
    const data = inviAllR.value!
    exportInvisDetailsDate(data)
    invisR.value = data
    dateRangeR.value[0] = data[0].date! + data[0].time?.starttime
    dateRangeR.value[1] = data[data.length - 1].date! + data[data.length - 1].time?.starttime
  }
  loading.close()
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
        <el-col :span="4" :offset="8" style="text-align: right">
          <el-select
            @change="selectF"
            v-model="exportOptionR"
            placeholder="导出监考表格"
            size="large">
            <el-option
              v-for="option of exportOptions"
              :key="option.id"
              :label="option.name"
              :value="option.id" />
          </el-select>
        </el-col>
      </el-row>
    </el-col>
    <el-col>
      <InvisDetailsDate :invis="invisR ?? []" />
    </el-col>
  </el-row>
</template>
