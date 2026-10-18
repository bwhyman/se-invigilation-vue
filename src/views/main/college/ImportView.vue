<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import router from '@/router'
import { CollegeService } from '@/services/CollegeService'
import { CommonService } from '@/services/CommonService'
import { IMPORT } from '@/services/Const'
import { stringInviTime } from '@/services/Utils'
import type { InviFile, Invigilation, Page } from '@/types'
import InviTable from '@/views/main/component/InviTable.vue'
import InviTypes from '@/views/main/component/InviTypes.vue'

const invisR = ref<Invigilation[]>([])
const inviTypeR = ref<{ type: string }>()
const { data: userS, suspense } = CommonService.getUserInfoService()
await suspense()

const pageR = ref<Page>({
  noPage: true,
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
const { mutateAsync } = CollegeService.addInvigilationsService()
const addInvis = async () => {
  invisR.value.forEach((invi) => {
    invi.collId = userS.value!.department?.collId
    invi.status = IMPORT
    invi.importer = stringInviTime(userS.value!)
  })
  const result = invisR.value
  invisR.value = []
  await mutateAsync(result)
  createElNotificationSuccess('导入成功')
  router.push('/college/imported')
}

//
//
//
const inviFileInput = ref<HTMLElement>()

const inviFileR = ref<InviFile>()
const inviFileTypes: InviFile[] = [
  { name: '随堂考试管理', id: 1 },
  { name: '排考结果信息', id: 2 }
]

const inviFileChangeF = () => {
  nextTick(() => {
    inviFileInput.value?.click()
  })
}

const readInviFile = async (event: Event) => {
  const element = event.target as HTMLInputElement
  if (!element || !element.files) {
    return
  }
  let result: Invigilation[] = []
  try {
    switch (inviFileR.value?.id) {
      case 1: {
        const { readSuitangkaosInviExcel } = await import('@/services/excel/Invi3Excel')
        result = await readSuitangkaosInviExcel(element.files[0])
        break
      }
      case 2: {
        const { readPaikaojieguoInviExcel } = await import('@/services/excel/Invi3Excel')
        result = await readPaikaojieguoInviExcel(element.files[0])
        break
      }
    }
    invisR.value = result
    pageR.value.total = result.length
    //console.log(result)
  } finally {
    element.value = ''
  }
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <p>读取新版教务系统导出的，随堂考试管理等等表格。无需原来的监考表格-模板。</p>
      <p>仍然必须选择阶段/期末考试类型才能导入系统。</p>
      <p>随堂考试管理表格中，考试教室，如果是多个，自动拆分为独立考试。</p>
      <p>教务表格的问题：没有监考人数量，所以默认均为2人。</p>
      <el-select
        v-model="inviFileR"
        value-key="id"
        @change="inviFileChangeF"
        placeholder="数据来源"
        size="large"
        style="width: 200px; margin-right: 10px">
        <el-option
          v-for="inviF of inviFileTypes"
          :key="inviF.id"
          :label="inviF.name"
          :value="inviF" />
      </el-select>
    </el-col>
    <el-col v-if="inviFileR">
      <input type="file" hidden ref="inviFileInput" @change="readInviFile" accept=".xlsx, .xls" />
    </el-col>
  </el-row>
  <el-row class="my-row">
    <el-col>建议直接读取新版教务系统导出的表格。统一后，移除以下功能。</el-col>
    <el-col>
      <p>
        阶段/期末：在课程名称后追加`阶段/期末`，监考老师相互协调派研究生；
        <br />
        绿色区域：课程名称，地点，人数，必填；
        <br />
        单考试记录多考场：自动将地点中包含2个考场的考试拆分为2个考试；
        <br />
        其他功能：自动删除课程/教师后的编号；自动过滤监考人数中的'人'字，仅取数字；
        <br />
        表格中日期请使用文本类型，不要使用日期时间类型；
        <br />
        支持多种日期时间组合模式，数字自动补位/中英文符号替换等；
        <br />
        <img src="@/assets/timeformat.png" width="500px" />
      </p>
    </el-col>

    <el-col :span="12">
      <input type="file" @change="readInvis" accept=".xlsx, .xls" />
      <a href="/监考表格-模板.xlsx">监考表格-模板.xlsx</a>
    </el-col>
    <el-col :span="10">
      <el-button type="primary" @click="$router.push('/college/addinvi')">录入</el-button>
    </el-col>
  </el-row>
  <el-row class="my-row" v-if="invisR.length > 0">
    <el-col :span="22">
      <InviTypes :invis="invisR" ref="inviTypeR" />
    </el-col>
    <el-col :span="2">
      <el-button
        type="success"
        @click="addInvis"
        :disabled="!inviTypeR?.type"
        style="vertical-align: middle">
        导入
      </el-button>
    </el-col>
    <el-col>
      <InviTable :invis="invisR" :page="pageR" :show-executor="false" />
    </el-col>
  </el-row>
</template>
