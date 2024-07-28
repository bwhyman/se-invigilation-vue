<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import router from '@/router'
import { CollegeService } from '@/services/CollegeService'
import type { Notice } from '@/types'
const params = useRoute().params as { depid: string }
// notice

const dispatchers = await CollegeService.listDispatchersService(params.depid)
const selDisR = ref<string[]>([])

const noticeDispatchersF = async () => {
  const message = `已下发新监考信息，请及时分配。`
  const notice: Notice = {
    userIds: selDisR.value.join(','),
    noticeMessage: message
  }
  const result = await CollegeService.noticeDispatcherService(notice)
  if (result?.errcode != 0) {
    throw '发送钉钉通知错误，请重新尝试'
  }
  createElNotificationSuccess(`发送通知成功。task_id: ${result.task_id}`)
  router.push('/college/imported')
}
</script>
<template>
  <el-row class="my-row">
    <el-col>已下发至专业。钉钉通知负责人尽快分配？</el-col>
    <el-col>
      <el-checkbox-group v-model="selDisR">
        <el-checkbox
          v-for="(user, index) of dispatchers"
          :key="index"
          :label="user.dingUserId"
          size="large">
          {{ user.name }}
        </el-checkbox>
      </el-checkbox-group>
    </el-col>
    <el-col>
      <el-button type="success" @click="noticeDispatchersF" :disabled="!selDisR">提交</el-button>
    </el-col>
  </el-row>
</template>
