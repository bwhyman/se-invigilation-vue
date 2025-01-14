<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import { SETTING_SHOWAVG } from '@/services/Const'
import type { Setting } from '@/types'

const settingsS = await CollegeService.listSettingsService()
const showAvgR = ref(settingsS.value?.find((s) => s.skey === SETTING_SHOWAVG.name)?.svalue)

const submitShowAvgF = async () => {
  const settingId = settingsS.value?.find((s) => s.skey === SETTING_SHOWAVG.name)?.id
  const setting: Setting = { id: settingId, svalue: showAvgR.value }
  await CollegeService.updateSettingService(setting)
  createElNotificationSuccess('更新设置成功')
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      下发时，显示专业内教师平均监考次数，用于平衡学院教师监考数量。
      <br />
      计算方式：专业全部开放教师监考次数 除以 专业全部开放教师。即，不计算关闭教师监考。
    </el-col>
    <el-col>
      <el-switch
        v-model="showAvgR"
        size="large"
        active-value="1"
        inactive-value="0"
        active-text="打开"
        inactive-text="关闭"
        style="margin-right: 10px" />
      <el-button type="success" @click="submitShowAvgF">提交</el-button>
    </el-col>
  </el-row>
</template>
