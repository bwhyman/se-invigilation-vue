<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import router from '@/router'
import { CollegeService } from '@/services/CollegeService'
import { CommonService } from '@/services/CommonService'
import { LOCATIONS } from '@/services/Const'
import { getCancelNotice } from '@/services/Utils'
import type { Invigilation } from '@/types'

const params = useRoute().params as { inviid: string }
const { data: invi, suspense } = CollegeService.getCollegeInviService(params.inviid)
await suspense()
const isAssigned = computed(() => invi.value && invi.value.executor)
const unlockedR = computed(() => invi.value && !invi.value.executor)
if (!invi.value) {
  throw '获取监考信息错误！'
}

const inviR = ref<Invigilation>(JSON.parse(JSON.stringify(invi.value)))
const courseR = ref(inviR.value.course!)
const timeR = ref(inviR.value.time!)
//
const { mutateAsync } = CollegeService.updateInviService()
const editInviF = async () => {
  if (!invi.value) throw '监考信息读取错误'
  inviR.value.course = courseR.value
  inviR.value.time = timeR.value
  await mutateAsync(inviR.value)

  createElNotificationSuccess('修改成功')
  //router.push('/college/imported')
  //inviR.value = { course: {}, time: {} }
}

const locations = LOCATIONS
const querySearch = (queryString: string, cb: any) => {
  const results = queryString ? locations.filter((r) => r.value == queryString) : locations
  cb(results)
}

// 判断是否需要发送
const cancelNotice = getCancelNotice(invi.value)

const { mutateAsync: mutNotice } = CommonService.noticeDingCancelService()
const { mutateAsync: mutDelInvi } = CollegeService.delInviService(invi.value.status!)

const delInvi = () => {
  ElMessageBox.confirm('删除监考将不可恢复，确定删除？', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  }).then(async () => {
    cancelNotice && (await mutNotice({ notice: cancelNotice, inviid: invi.value.id! }))
    await mutDelInvi(invi.value!.id!)
    createElNotificationSuccess('监考已删除')
    router.push(`/college/imported`)
  })
}

//
const { mutateAsync: mutResetInvi } = CollegeService.resetInviService()
const resetInvi = () => {
  ElMessageBox.confirm('确定重置监考？', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  }).then(async () => {
    cancelNotice && (await mutNotice({ notice: cancelNotice, inviid: invi.value.id! }))
    await mutResetInvi(invi.value!.id!)
    createElNotificationSuccess('监考已重置')
    router.push(`/college/imported`)
  })
}

const timeSelectR = ref<{ endSTime?: string; endETime?: string }>({})

watch(
  () => timeR.value.starttime,
  () => {
    if (!timeR.value.starttime) return
    const stime = timeR.value.starttime
    const mins = stime.split(':')[1]
    const hoursT = Number.parseInt(stime.split(':')[0]) + 1
    const sHours = hoursT < 10 ? `0${hoursT}` : hoursT
    const es = hoursT + 2
    const eHours = es < 10 ? `0${es}` : es
    timeSelectR.value.endSTime = `${sHours}:${mins}`
    timeSelectR.value.endETime = `${eHours}:${mins}`
  }
)
</script>
<template>
  <el-row class="my-row">
    <el-col></el-col>
    <el-col :span="12">
      <el-form label-width="120px">
        <el-form-item label="专业" v-if="invi?.department">
          <el-tag>
            {{ invi?.department?.departmentName }}
          </el-tag>
        </el-form-item>
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="courseR.courseName" />
        </el-form-item>
        <el-form-item label="授课教师" prop="teacherName">
          <el-input v-model="courseR.teacherName" style="width: 150px" />
        </el-form-item>
        <el-form-item label="班级" prop="clazz">
          <el-input v-model="courseR.clazz" />
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-date-picker
            :disabled="!unlockedR"
            v-model="inviR.date"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            placeholder="日期"
            style="width: 150px" />
        </el-form-item>

        <el-form-item label="时间">
          <el-col :span="11">
            <el-form-item prop="stime">
              <el-time-select
                :disabled="!unlockedR"
                v-model="timeR.starttime"
                placeholder="开始时间"
                start="08:00"
                step="00:05"
                end="20:00"
                style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col class="text-center" :span="2"></el-col>
          <el-col :span="11">
            <el-form-item prop="etime">
              <el-time-select
                :disabled="!unlockedR"
                v-model="timeR.endtime"
                :start="timeSelectR.endSTime"
                step="00:30"
                :end="timeSelectR.endETime"
                style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label="地点" prop="location">
          <el-autocomplete
            :disabled="!unlockedR"
            v-model="courseR.location"
            :fetch-suggestions="querySearch"
            clearable
            style="width: 150px"
            placeholder="地点" />
        </el-form-item>
        <el-form-item label="人数" prop="amount">
          <el-input-number v-model="inviR.amount" :min="1" :max="4" :disabled="!unlockedR" />
        </el-form-item>
        <div v-if="isAssigned">
          <el-form-item label="分配">
            <el-tag v-for="(user, index) of invi!.executor" :key="index">
              {{ user.userName }}
            </el-tag>
          </el-form-item>
        </div>
        <el-form-item label="确认信息" v-if="isAssigned">
          <el-tag type="danger">
            由于专业已完成监考分配，时间/地点/人数等信息禁止修改。选择`重置监考`后修改并重新下发至专业
          </el-tag>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="editInviF">提交</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>

  <el-row class="my-row">
    <el-col>
      <div style="margin-bottom: 10px">
        将已下发至专业监考取消，转为录入未分配状态，如果已经分配，将取消分配并向监考教师发送取消通知。
      </div>
      <el-button type="danger" @click="resetInvi">重置监考</el-button>
    </el-col>
  </el-row>
  <el-row class="my-row">
    <el-col>
      <div style="margin-bottom: 10px">
        删除监考，将向监考教师发送钉钉取消监考工作通知，取消监考日程，并删除监考数据。
      </div>
      <el-button type="danger" @click="delInvi">删除监考</el-button>
    </el-col>
  </el-row>
</template>
