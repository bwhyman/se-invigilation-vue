<script lang="ts" setup>
import { Setting, SwitchButton } from '@element-plus/icons-vue'
import { COLLEGE_ADMIN, SUBJECT_ADMIN } from '@/services/Const'
import { useUserStore } from '@/stores/UserStore'
const collegeNav = defineAsyncComponent(() => import('@/views/main/college/header/IndexView.vue'))
const subjectNav = defineAsyncComponent(() => import('@/views/main/subject/header/IndexView.vue'))

const role = sessionStorage.getItem('role')
const user = storeToRefs(useUserStore()).userS

const logout = () => {
  sessionStorage.clear()
  window.location.href = '/'
}
</script>
<template>
  <el-row class="my-row" style="padding: 3px" align="middle">
    <el-col :span="4">
      <el-button
        type="danger"
        :icon="Setting"
        @click="$router.push('/settings')"
        style="margin: 10px">
        {{ user?.name }}
      </el-button>
    </el-col>

    <!-- 基于权限加载上功能栏 -->
    <el-col :span="18">
      <collegeNav v-if="role == COLLEGE_ADMIN" />
      <subjectNav v-if="role == SUBJECT_ADMIN" />
    </el-col>
    <el-col :span="2">
      <!-- <el-icon id="refresh" :size="32" color="red" @click="logout">
        <Refresh />
      </el-icon> -->
      <el-icon id="switch" :size="32" color="red" @click="logout"><SwitchButton /></el-icon>
    </el-col>
  </el-row>
</template>
<style scoped>
#switch :hover {
  cursor: pointer;
}
</style>
