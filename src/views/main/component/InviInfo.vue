<script setup lang="ts">
import { getInviChineseDayweek, getInviWeek } from '@/services/Utils'
import type { Invigilation } from '@/types'

const props = defineProps<{ invi: Invigilation }>()
const WeekC = getInviWeek(props.invi.date!)
const dayweekCN = getInviChineseDayweek(props.invi.date!)
</script>
<template>
  {{ props.invi.date }} 第{{ WeekC }}周 {{ dayweekCN }} {{ props.invi.time?.starttime }} ~
  {{ props.invi.time?.endtime }}
  <br />
  {{ props.invi.course!.teacherName }} / {{ props.invi.course!.courseName }} /
  {{ props.invi.course!.clazz }}

  <br />
  {{ props.invi.course!.location }} /
  <el-tag>{{ props.invi.amount }}</el-tag>
  人
</template>
