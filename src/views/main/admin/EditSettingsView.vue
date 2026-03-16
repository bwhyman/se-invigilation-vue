<script setup lang="ts">
import { AdminService } from '@/services/AdminService'
import { CommonService } from '@/services/CommonService'
import type { Setting } from '@/types'

const { data: store } = CommonService.listSettingsService()
const { mutateAsync } = AdminService.updateSettingService()

const editF = async (setting: Setting) => {
  await mutateAsync({ id: setting.id, svalue: setting.svalue })
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <el-table :data="store?.settings">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column width="150">
          <template #default="scope">
            {{ (scope.row as Setting).skey }}
          </template>
        </el-table-column>
        <el-table-column>
          <template #default="scope">
            <el-input
              v-model="(scope.row as Setting).svalue"
              style="width: 200px; margin-right: 10px" />
            <el-button type="success" @click="editF(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-col>
  </el-row>
</template>
