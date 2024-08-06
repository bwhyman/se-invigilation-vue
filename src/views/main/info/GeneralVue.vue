<script setup lang="ts"></script>
<template>
  <el-row>
    <el-col class="info-title" :span="2">
      <el-tag size="large">说明</el-tag>
    </el-col>
    <el-col :span="22">
      专业无权拒绝下发的监考，欲取消请与学院协商。
      <br />
      教师无权拒绝分配的监考，欲取消请与专业协商。即使教师在钉钉拒绝接受监考日程安排，系统仍按已分配教师记录。
      <br />
      即，系统为单向数据流的通知系统，而非审批系统。
    </el-col>
    <el-col class="info-title" :span="2"><el-tag size="large">密码</el-tag></el-col>
    <el-col :span="22">点击左上角姓名可修改登录密码。</el-col>
    <el-col class="info-title" :span="2"><el-tag size="large">录入</el-tag></el-col>
    <el-col :span="22">
      支持学院/专业录入监考信息，但专业无权直接分配，必须由学院统计并统一分配。
      <br />
      必须选择`阶段/期末`类型，才能提交。没有设置默认值，是为了避免忘记选择而误提交。
    </el-col>
    <el-col class="info-title" :span="2"><el-tag size="large">其他</el-tag></el-col>
    <el-col :span="22">
      钉钉监考分配通知内包含系统网址，但是钉钉移动版默认使用内置浏览器打开，而钉钉内置浏览器内核版本太低不支持系统的前端技术。因此，只能使用钉钉PC版，或将网址复制使用外部浏览器打开。
    </el-col>
  </el-row>
</template>
