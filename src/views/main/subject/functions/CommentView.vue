<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { SubjectService } from '@/services/SubjectService'

const comment = await SubjectService.getDepartmentCommentService()
const commentR = ref(comment)
const sendF = async () => {
  if (commentR.value.length == 0) {
    throw '备注信息为空'
  }

  await SubjectService.addDepartmentCommentService(commentR.value)
  createElNotificationSuccess('备注信息已保存')
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      专业备注，非系统强制性的监考限制说明，描述信息在监考分配视图显示以提示监考分配负责人。
      <br />
      记录例如，王明老师周一12节送孩子不分配监考；李强老师周末不分配监考等。
    </el-col>
    <el-col>
      <el-form>
        <el-input
          style="margin-bottom: 10px"
          v-model="commentR"
          :autosize="{ minRows: 5, maxRows: 10 }"
          type="textarea" />
        <el-button type="primary" @click="sendF">提交</el-button>
      </el-form>
    </el-col>
  </el-row>
</template>
