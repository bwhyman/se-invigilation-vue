<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { CommonService } from '@/services/CommonService'
import { IMPORT, LOCATIONS, SUBJECT_ADMIN } from '@/services/Const'
import { stringInviTime } from '@/services/Utils'
import { useUserStore } from '@/stores/UserStore'
import type { Invigilation } from '@/types'
import InviTypes from './InviTypes.vue'
const userS = useUserStore().userS
const inviR = ref<Invigilation>({ course: {}, time: {} })
const inviTypeR = ref<{ type: string }>()

const submitForm = async () => {
  if (!userS.value) return
  if (
    !inviR.value.course?.courseName ||
    !inviR.value.course?.clazz ||
    !inviR.value.course?.location ||
    !inviR.value.course?.teacherName
  ) {
    throw '请填写完整考试课程信息'
  }
  if (!inviTypeR.value?.type) {
    throw '请选择考试类型'
  }
  if (!inviR.value.date || !inviR.value.time?.starttime || !inviR.value.time?.endtime) {
    throw '请填写完整考试时间信息'
  }

  inviR.value.collId = userS.value.department?.collId
  inviR.value.status = IMPORT
  inviR.value.importer = stringInviTime({ id: userS.value.id, name: userS.value.name })
  await CommonService.addInviSerivce(inviR.value)
  inviR.value = { course: {}, time: {} }
  inviTypeR.value.type = ''
  createElNotificationSuccess('监考录入成功')
}

const locations = LOCATIONS

const querySearch = (queryString: string, cb: any) => {
  const results = queryString ? locations.filter((r) => r.value == queryString) : locations
  cb(results)
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <el-form label-width="120px" style="width: 500px">
        <el-form-item v-if="userS?.role === SUBJECT_ADMIN">
          <el-tag type="danger" size="large">
            用于录入随堂阶段考试等教务处系统中没有的考试。专业提交的监考，将由学院统计并统一分配。
          </el-tag>
        </el-form-item>
        <el-form-item label="课程名称">
          <el-input
            v-model="inviR.course!.courseName"
            @keydown.delete="inviR.course!.courseName = ''" />
        </el-form-item>
        <el-form-item label="类型">
          <InviTypes :invis="[inviR]" ref="inviTypeR" />
        </el-form-item>
        <el-form-item label="班级">
          <el-input v-model="inviR.course!.clazz" />
        </el-form-item>
        <el-form-item label="授课教师">
          <el-input v-model="inviR.course!.teacherName" style="width: 150px" />
        </el-form-item>
        <el-form-item label="地点">
          <el-autocomplete
            v-model="inviR.course!.location"
            :fetch-suggestions="querySearch"
            clearable
            style="width: 150px"
            placeholder="考试地点" />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="inviR.date"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            aria-label="日期"
            placeholder="日期"
            style="width: 150px" />
        </el-form-item>
        <el-form-item label="时间">
          <el-col :span="11">
            <el-form-item>
              <el-time-select
                :max-time="inviR.time!.endtime"
                v-model="inviR.time!.starttime"
                placeholder="开始时间"
                start="08:00"
                step="00:10"
                end="20:00"
                style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col class="text-center" :span="2"></el-col>
          <el-col :span="11">
            <el-form-item>
              <el-time-select
                :min-time="inviR.time!.starttime"
                v-model="inviR.time!.endtime"
                placeholder="结束时间"
                start="09:30"
                step="00:10"
                end="22:00"
                style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-form-item>

        <el-form-item label="人数">
          <el-input-number v-model="inviR.amount" :min="1" :max="6" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">提交</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>
