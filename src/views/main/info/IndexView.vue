<script setup lang="ts">
import CollegeVue from './CollegeVue.vue'
import GeneralVue from './GeneralVue.vue'
import SubjectVue from './SubjectVue.vue'

const activeName = ref('general')
const active = ref(4)
</script>
<template>
  <el-row class="my-row">
    <el-col class="my-col" :span="12" :offset="6">
      <el-steps :active="active" finish-status="success">
        <el-step title="导入" />
        <el-step title="下发" />
        <el-step title="分配" />
        <el-step title="通知" />
      </el-steps>
    </el-col>
    <el-col>
      <el-tabs v-model="activeName" class="demo-tabs">
        <el-tab-pane label="通用" name="general">
          <GeneralVue />
        </el-tab-pane>
        <el-tab-pane label="学院" name="college">
          <CollegeVue />
        </el-tab-pane>
        <el-tab-pane label="专业" name="subject">
          <SubjectVue />
        </el-tab-pane>
      </el-tabs>
    </el-col>
  </el-row>
</template>
<style>
.info-title {
  text-align: right;
  padding-right: 10px;
  margin-bottom: 10px;
}
</style>
