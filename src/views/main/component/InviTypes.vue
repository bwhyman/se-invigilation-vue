<script setup lang="ts">
import { INVI_TYPES } from '@/services/Const'
import type { Invigilation } from '@/types'
const props = defineProps<{ invis: Invigilation[] }>()

const inviTypeR = ref('')

watchEffect(() => {
  if (!props.invis[0].course || !props.invis[0].course.courseName) {
    inviTypeR.value = ''
    return
  }
  INVI_TYPES.forEach((it) => {
    props.invis.forEach((invi) => {
      invi.course!.courseName = invi.course!.courseName!.replaceAll(it, '')
    })
  })
  props.invis.forEach((invi) => {
    invi.course!.courseName += inviTypeR.value
  })
})

defineExpose({ type: inviTypeR })
</script>
<template>
  <el-radio-group
    v-model="inviTypeR"
    style="margin-right: 10px; vertical-align: middle"
    :disabled="!props.invis[0].course?.courseName">
    <el-radio-button v-for="(type, index) of INVI_TYPES" :key="index" :value="type">
      {{ type }}
    </el-radio-button>
  </el-radio-group>
</template>
