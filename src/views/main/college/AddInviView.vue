<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import router from '@/router'
import { CollegeService } from '@/services/CollegeService'
import { IMPORT } from '@/services/Const'
import { stringInviTime } from '@/services/Utils'
import { useUserStore } from '@/stores/UserStore'
import type { Invigilation } from '@/types'
import type { FormInstance, FormRules } from 'element-plus'

const inviR = ref<Invigilation>({ course: {}, time: {} })

const submitForm = async (formEl: FormInstance | undefined) => {
  const userS = useUserStore().userS
  if (!userS.value) return
  let sub = false
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      sub = true
      console.log('submit!')
    } else {
      console.log('error submit!', fields)
    }
  })
  if (!sub) return

  inviR.value.course!.teacherName = formR.value.teacherName
  inviR.value.course!.courseName = formR.value.courseName
  inviR.value.course!.clazz = formR.value.clazz
  inviR.value.course!.location = formR.value.location
  inviR.value.amount = formR.value.amount
  inviR.value.date = formR.value.date
  inviR.value.time!.starttime = formR.value.stime
  inviR.value.time!.endtime = formR.value.etime

  inviR.value.collId = userS.value.department?.collId
  inviR.value.status = IMPORT
  inviR.value.importer = stringInviTime({ id: userS.value.id, name: userS.value.name })
  await CollegeService.addInviSerivce(inviR.value)
  inviR.value = { course: {}, time: {} }
  formR.value = {
    courseName: '',
    teacherName: '',
    clazz: '',
    date: '',
    stime: '',
    etime: '',
    location: '',
    amount: 1
  }
  createElNotificationSuccess('添加成功')
  router.push('/college/imported')
}

const locations = [{ value: '丹青楼' }, { value: '锦绣楼' }, { value: '成栋楼' }]
const querySearch = (queryString: string, cb: any) => {
  const results = queryString ? locations.filter((r) => r.value == queryString) : locations
  cb(results)
}
const init = {
  courseName: '',
  teacherName: '',
  clazz: '',
  date: '',
  stime: '',
  etime: '',
  location: '',
  amount: 1
}
const formR = ref<RuleForm>(init)

interface RuleForm {
  courseName: string
  teacherName: string
  clazz: string
  date: string
  stime: string
  etime: string
  location: string
  amount: number
}
const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules<RuleForm>>({
  courseName: [{ required: true, type: 'string', message: '必填', trigger: 'blur' }],
  teacherName: [
    {
      type: 'string',
      required: true,
      message: '必填',
      trigger: 'blur'
    }
  ],
  clazz: [
    {
      type: 'string',
      required: true,
      message: '必填',
      trigger: 'blur'
    }
  ],
  date: [
    {
      type: 'date',
      required: true,
      message: '必填',
      trigger: 'blur'
    }
  ],
  stime: [
    {
      type: 'string',
      required: true,
      message: '必填',
      trigger: 'change'
    }
  ],
  etime: [
    {
      type: 'string',
      required: true,
      message: '必填',
      trigger: 'change'
    }
  ],
  location: [
    {
      required: true,
      message: '必填',
      trigger: 'change'
    }
  ],
  amount: [
    {
      type: 'number',
      required: true,
      message: '必填',
      trigger: 'change'
    }
  ]
})
</script>
<template>
  <el-row class="my-row">
    <el-col :span="12">
      <el-form :model="formR" label-width="120px" :rules="rules" ref="ruleFormRef">
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="formR.courseName" />
        </el-form-item>
        <el-form-item label="授课教师" prop="teacherName">
          <el-input v-model="formR.teacherName" style="width: 120px" />
        </el-form-item>
        <el-form-item label="班级" prop="clazz">
          <el-input v-model="formR.clazz" />
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="formR.date"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            label="日期"
            placeholder="日期"
            style="width: 120px" />
        </el-form-item>

        <el-form-item label="时间">
          <el-col :span="11">
            <el-form-item prop="stime">
              <el-time-picker
                format="HH:mm"
                type="time"
                value-format="HH:mm"
                v-model="formR.stime"
                label="开始时间"
                placeholder="开始时间"
                style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col class="text-center" :span="2"></el-col>
          <el-col :span="11">
            <el-form-item prop="etime">
              <el-time-picker
                type="time"
                format="HH:mm"
                value-format="HH:mm"
                v-model="formR.etime"
                label="结束时间"
                placeholder="结束时间"
                style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label="地点" prop="location">
          <el-autocomplete
            v-model="formR.location"
            :fetch-suggestions="querySearch"
            clearable
            class="inline-input w-50"
            placeholder="地点" />
        </el-form-item>
        <el-form-item label="人数" prop="amount">
          <el-input-number v-model="formR.amount" :min="1" :max="4" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm(ruleFormRef)">提交</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>
