<script setup lang="ts">
import { removeCollegeInvisService } from '@/services/CollegeService'
import { createElNotificationSuccess } from '@/components/message'

const removeInvisF = () => {
  ElMessageBox.confirm(`删除的全部监考信息将无法恢复，确定删除？`, 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  }).then(async () => {
    await removeCollegeInvisService()
    createElNotificationSuccess('删除成功')
  })
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <el-button type="success" @click="removeInvisF">
        移除学院全部监考及分配信息，用于学期初始化重新计算
      </el-button>
    </el-col>
  </el-row>
</template>
