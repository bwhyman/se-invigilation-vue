<script setup lang="ts">
import router from '@/router'
import { delInviService, resetInviService, updateInviService } from '@/services/CollegeService'
import { getInviService } from '@/services/CommonService'
import { IMPORT } from '@/services/Const'
import { useMessageStore } from '@/stores/MessageStore'
import type { Invigilation } from '@/types'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps<{ inviid: string }>()
let invi = await getInviService(props.inviid)
const isAssigned = ref(false)
const unlockedR = ref(true)

if (invi?.executor) {
  isAssigned.value = true
  unlockedR.value = false
}

let inviR: Invigilation = { course: {}, time: {} }

const init = {
  courseName: invi?.course?.courseName ?? '',
  teacherName: invi?.course?.teacherName ?? '',
  clazz: invi?.course?.clazz ?? '',
  date: invi?.date ?? '',
  stime: invi?.time?.starttime ?? '',
  etime: invi?.time?.endtime ?? '',
  location: invi?.course?.location ?? '',
  amount: invi?.amount ?? 1
}

const formR = ref<RuleForm>(init)

const submitForm = async (formEl: FormInstance | undefined) => {
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

  inviR.id = invi?.id
  inviR.course!.courseName = formR.value.courseName
  inviR.course!.clazz = formR.value.clazz
  inviR.course!.location = formR.value.location
  inviR.course!.teacherName = formR.value.teacherName
  inviR.amount = formR.value.amount
  inviR.date = formR.value.date
  inviR.time!.starttime = formR.value.stime
  inviR.time!.endtime = formR.value.etime
  inviR.status = IMPORT
  updateInviService(inviR).then(() => {
    storeToRefs(useMessageStore()).messageS.value = '修改成功'
    storeToRefs(useMessageStore()).closeF.value = () => {
      router.push('/college/imported')
    }

    inviR = { course: {}, time: {} }
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
  })
}

const locations = [{ value: '丹青楼' }, { value: '锦绣楼' }, { value: '成栋楼' }]
const querySearch = (queryString: string, cb: any) => {
  const results = queryString ? locations.filter((r) => r.value == queryString) : locations
  cb(results)
}

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
      type: 'string',
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

const delInvi = () => {
  ElMessageBox.confirm('删除监考将不可恢复，确定删除？', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  })
    .then(() => {
      ElMessage({
        type: 'success',
        message: 'Delete completed'
      })
      delInviService(invi!.id!).then(() => {
        setTimeout(() => {
          router.push(`/college/imported`)
        }, 1000)
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: 'Delete canceled'
      })
    })
}

const resetInvi = () => {
  ElMessageBox.confirm('确定重置监考？', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  })
    .then(() => {
      ElMessage({
        type: 'success',
        message: 'Delete completed'
      })
      resetInviService(invi!.id!).then(() => {
        setTimeout(() => {
          router.push(`/college/imported`)
        }, 2000)
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: 'Delete canceled'
      })
    })
}
</script>
<template>
  <el-row class="my-row">
    <el-col></el-col>
    <el-col :span="12">
      <el-form :model="formR" label-width="120px" :rules="rules" ref="ruleFormRef">
        <el-form-item label="专业" v-if="invi?.department">
          <el-tag>
            {{ invi?.department?.departmentName }}
          </el-tag>
        </el-form-item>
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
            :disabled="!unlockedR"
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
                :disabled="!unlockedR"
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
                :disabled="!unlockedR"
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
            :disabled="!unlockedR"
            v-model="formR.location"
            :fetch-suggestions="querySearch"
            clearable
            class="inline-input w-50"
            placeholder="地点" />
        </el-form-item>
        <el-form-item label="人数" prop="amount">
          <el-input-number v-model="formR.amount" :min="1" :max="4" :disabled="!unlockedR" />
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
          <el-button type="primary" @click="submitForm(ruleFormRef)">提交</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>

  <el-row class="my-row">
    <el-col>
      <div style="margin-bottom: 10px">
        将已下发至专业监考取消，转为导入未分配状态，如果已经分配，将取消分配并向监考教师发送取消通知。
      </div>
      <el-button type="danger" @click="resetInvi">重置监考</el-button>
    </el-col>
  </el-row>
  <el-row class="my-row">
    <el-col>
      <div style="margin-bottom: 10px">
        删除监考，将向监考教师发送钉钉取消监考工作通知，及取消监考日程
      </div>

      <el-button type="danger" @click="delInvi">删除监考</el-button>
    </el-col>
  </el-row>
</template>
