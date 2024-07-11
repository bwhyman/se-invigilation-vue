<script lang="ts" setup>
import { Setting, SwitchButton, Sunrise } from '@element-plus/icons-vue'
import { COLLEGE_ADMIN, SUBJECT_ADMIN } from '@/services/Const'
import router from '@/router'
import type { Component } from 'vue'
import { useUserStore } from '@/stores/UserStore'

const role = sessionStorage.getItem('role')
const user = useUserStore().userS

let nemuComponent: Component

if (role == COLLEGE_ADMIN) {
  nemuComponent = defineAsyncComponent(() => import('@/views/main/college/header/IndexView.vue'))
} else if (role == SUBJECT_ADMIN) {
  nemuComponent = defineAsyncComponent(() => import('@/views/main/subject/header/IndexView.vue'))
}

const logout = () => {
  sessionStorage.clear()
  localStorage.clear()
  window.location.href = '/'
}
const info = () => {
  router.push('/info')
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
    <el-col :span="16">
      <component :is="nemuComponent" />
    </el-col>
    <el-col :span="4" style="text-align: right; padding-right: 10px">
      <el-icon id="info" :size="32" color="#409EFF" @click="info" style="margin-right: 10px">
        <Sunrise />
      </el-icon>
      <el-icon id="switch" :size="32" color="red" @click="logout"><SwitchButton /></el-icon>
    </el-col>
  </el-row>
</template>
<style scoped>
#switch,
#info :hover {
  cursor: pointer;
}
</style>
