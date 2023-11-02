<script setup lang="ts">
import router from '@/router'
import { listDispatchersService, noticeDispatcherService } from '@/services/CollegeService'
import { getSettingsService } from '@/services/CommonService'
import { useMessageStore } from '@/stores/MessageStore'
import { useSettingStore } from '@/stores/SettingStore'
import type { Notice, User } from '@/types'
const props = defineProps<{ depid: string }>()

// notice
const dispatchersR = ref<User[]>([])
const selDisR = ref<string[]>([])

const results = await Promise.all([listDispatchersService(props.depid), getSettingsService()])

dispatchersR.value = results[0]

const noticeDispatchersF = () => {
  const settingStore = useSettingStore()
  const weburl = settingStore.getWebUrl()
  const message = `已下发新监考信息，请及时分配。\n${weburl}`
  const notice: Notice = {
    userIds: selDisR.value.join(','),
    noticeMessage: message
  }
  noticeDispatcherService(notice).then((r) => {
    const { messageS, closeF } = storeToRefs(useMessageStore())
    if (r?.errcode != 0) {
      messageS.value = `发送通知错误`
      return
    }
    messageS.value = `发送通知成功。task_id: ${r.task_id}`
    closeF.value = () => {
      router.push('/college/imported')
    }
  })
}
</script>
<template>
  <el-row class="my-row">
    <el-col>已下发至专业。钉钉通知负责人尽快分配？</el-col>
    <el-col>
      <el-checkbox-group v-model="selDisR">
        <el-checkbox
          v-for="(user, index) of dispatchersR"
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
