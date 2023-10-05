<script setup lang="ts">
import router from '@/router'
import { listDispatchersService, noticeDispatcherService } from '@/services/CollegeService'
import { useMessageStore } from '@/stores/MessageStore'
import type { User } from '@/types'
const props = defineProps<{ depid: string }>()

// notice
const dispatchersR = ref<User[]>([])
const selDisR = ref<string[]>([])

dispatchersR.value = await listDispatchersService(props.depid)

const noticeDispatchersF = () => {
  noticeDispatcherService(selDisR.value).then((r) => {
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
      <el-button type="success" @click="noticeDispatchersF">提交</el-button>
    </el-col>
  </el-row>
</template>
