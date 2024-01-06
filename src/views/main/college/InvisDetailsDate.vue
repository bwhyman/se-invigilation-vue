<script setup lang="ts">
import type { Invigilation } from '@/types'
import { Crop } from '@element-plus/icons-vue'
const props = defineProps<{ invis: Invigilation[] }>()

const teachersC = computed(() => (invi: Invigilation) => {
  let names = ''
  for (const teacher of invi.executor!) {
    names += teacher.userName + '; '
  }
  return names
})
const fontColorC = computed(
  () => (invi: Invigilation) =>
    invi.course?.courseName?.includes('期末') ? { color: 'red' } : { color: 'black' }
)

const addTeacherNameF = (invis: Invigilation) => {
  const exe = invis.executor?.find((e) => e.userName == '外院系教师')
  if (!exe) {
    invis.executor?.push({ userName: '外院系教师', userId: '', time: '' })
    return
  }
  invis.executor?.splice(invis.executor.indexOf(exe), 1)
}

const indexR = ref(-1)
const showAddBtnC = computed(() => (index: number) => index == indexR.value)
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <table border style="border-collapse: collapse; font-size: 0.8rem; border: none">
        <tr style="background-color: gainsboro">
          <th>#</th>
          <th>授课教师</th>
          <th>课程</th>
          <th>班级</th>
          <th>考试时间</th>
          <th>考试地点</th>
          <th>监考教师</th>
        </tr>
        <tr v-for="(invi, index) of props.invis" :key="index" :style="fontColorC(invi)">
          <td>{{ index + 1 }}</td>
          <td>
            {{ invi.course?.teacherName }}
          </td>
          <td>{{ invi.course?.courseName }}</td>
          <td>{{ invi.course?.clazz }}</td>
          <td>{{ invi.date }} {{ invi.time?.starttime }}~{{ invi.time?.endtime }}</td>
          <td>{{ invi.course?.location }}</td>
          <td>
            {{ teachersC(invi) }}
          </td>
          <td @mouseenter="indexR = index" @mouseleave="indexR = -1" style="border: none">
            <el-button
              v-if="showAddBtnC(index)"
              @click="addTeacherNameF(invi)"
              :icon="Crop"
              circle
              type="success"
              style="max-width: 20px; max-height: 20px" />
          </td>
        </tr>
      </table>
    </el-col>
  </el-row>
</template>
<style scoped>
td {
  padding: 0 5px;
}
</style>
