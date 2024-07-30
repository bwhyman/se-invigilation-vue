<script setup lang="ts">
import { CollegeService } from '@/services/CollegeService'
import { createElNotificationSuccess } from '@/components/message'

const removeInvisF = () => {
  ElMessageBox.confirm(`移除全部监考/课表信息将无法恢复，确定删除？`, 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  }).then(async () => {
    await CollegeService.removeCollegeDataService()
    createElNotificationSuccess('移除成功')
  })
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <el-button type="danger" @click="removeInvisF">
        移除学院全部监考/分配/课表信息，用于学期初始化数据
      </el-button>
    </el-col>
  </el-row>
</template>
