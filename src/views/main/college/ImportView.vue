<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import router from '@/router'
import { CollegeService } from '@/services/CollegeService'
import { IMPORT } from '@/services/Const'
import { stringInviTime } from '@/services/Utils'
import { useUserStore } from '@/stores/UserStore'
import type { Invigilation } from '@/types'
import InviTable from '@/views/main/component/InviTable.vue'

const invisR = ref<Invigilation[]>([])
const inviTypeR = ref(0)
const userS = useUserStore().userS

const pageR = ref<{ currentpage?: number; total?: number; url?: string }>({
  currentpage: 0,
  total: 0,
  url: ''
})

const readInvis = async (event: Event) => {
  const element = event.target as HTMLInputElement
  if (!element || !element.files) {
    return
  }
  const { readInviExcel } = await import('@/services/excel/InviExcel')
  try {
    const result = await readInviExcel(element.files[0])
    invisR.value = result
    invisR.value.forEach((invi) => {
      invi.collId = userS.value!.department?.collId
      invi.status = IMPORT
      invi.importer = stringInviTime(userS.value!)
    })
  } finally {
    element.value = ''
  }
}

watch(inviTypeR, (newValue) => {
  if (invisR.value.length == 0) {
    return
  }
  invisR.value.forEach((invi) => {
    invi.course!.courseName = invi.course!.courseName?.replaceAll('阶段', '').replaceAll('期末', '')
    if (newValue == 1) {
      invi.course!.courseName += '阶段'
    }
    if (newValue == 2) {
      invi.course!.courseName += '期末'
    }
  })
})

const addInvis = async () => {
  const result = invisR.value
  invisR.value = []
  await CollegeService.addInvigilationsService(result)
  createElNotificationSuccess('导入成功')
  router.push('/college/imported')
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <p>
        阶段/期末：选择阶段，自动在课程名称后追加`阶段`字符，监考老师相互协调派研究生
        <br />
        绿色区域：课程名称，地点，人数，必填
        <br />
        黄色区域：支持日期+时间，或开始至截至时间，2种时间模式；2组不要重复填写
        <br />
        表格中日期使用文本类型，不要使用日期时间类型
        <br />
        日期格式：`2046-05-12`；时间格式：`08:00`
        <br />
        单考试记录多考场：自动将地点中包含2个考场的考试拆分为2个考试
        <br />
        其他功能：自动删除课程/教师后的编号；自动过滤监考人数中的'人'字，仅取数字
      </p>
    </el-col>

    <el-col :span="12">
      <input type="file" @change="readInvis" />
      <a href="/监考表格-模板.xlsx">监考表格-模板.xlsx</a>
    </el-col>
    <el-col :span="10">
      <el-button type="primary" @click="$router.push('/college/addinvi')">录入</el-button>
    </el-col>
  </el-row>
  <el-row class="my-row" v-if="invisR.length > 0">
    <el-col :span="22">
      <el-radio-group v-model="inviTypeR">
        <el-radio-button value="1">阶段</el-radio-button>
        <el-radio-button value="2">期末</el-radio-button>
      </el-radio-group>
    </el-col>
    <el-col :span="2">
      <el-button
        type="success"
        @click="addInvis"
        :disabled="inviTypeR == 0"
        style="vertical-align: middle">
        导入
      </el-button>
    </el-col>
    <el-col>
      <InviTable :invis="invisR" :page="pageR" :show-executor="false" />
    </el-col>
  </el-row>
</template>
