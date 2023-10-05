<script setup lang="ts"></script>
<template>
  <el-row class="my-row">
    <el-col class="my-col" :span="2"><el-tag size="large">过程</el-tag></el-col>
    <el-col class="my-col" :span="22">添加监考--下发监考至专业--专业分配--钉钉通知。</el-col>
    <el-col class="my-col" :span="2"><el-tag>导入</el-tag></el-col>
    <el-col class="my-col" :span="22">
      监考为不可分割的最小单元。即，如需将一次2人监考分别下发至2个专业，需分解为2次1人监考。在表格复制一行即可。
      <br />
      导入监考请使用监考表格模板。提供2种时间模式，匹配学校下发的不同时间类型。
      <br />
      必须选择`阶段/期末`类型，才能提交。没有设置默认值，是为了避免忘记选择而误存。
      <br />
      可手动单项添加监考。
    </el-col>
    <el-col class="my-col" :span="2"><el-tag size="large">下发</el-tag></el-col>
    <el-col class="my-col" :span="22">批量下发，多项选择监考，并指定部门后，保存提交。</el-col>
    <el-col class="my-col" :span="2"><el-tag size="large">分配</el-tag></el-col>
    <el-col class="my-col" :span="22">
      可在功能中关闭指定教师。
      <br />
      分配与通知，设计为2个独立步骤便于管理。
      <br />
      分配时，显示教师监考次数，当日教师授课/监考情况信息，提交时保存分配记录，但不发送钉钉通知。
      <br />
      可在一次监考中为同一教师分配多次，例如阶段时与研究生同时监考但记入教师次数。
      <br />
      分配后，可选择是否通知教师。
      <br />
      可重新分配。提交后删除原监考记录，创建新记录。向原监考教师发送钉钉取消监考工作通知，取消原监考教师钉钉日程并提醒。
    </el-col>
    <el-col class="my-col" :span="2"><el-tag size="large">通知</el-tag></el-col>
    <el-col class="my-col" :span="22">
      通知方式：使用钉钉工作通知/日程2种通知方式+3次提醒。发送通知：1.教师钉钉收到工作通知，2.教师钉钉收到监考日程第一次监考提醒。
      <br />
      系统同时额外另外设置了钉钉日程24+2小时2次提醒。教师钉钉将在监考前24小时收到第二次监考提醒，在2小时内收到第三次监考提醒。
      <br />
    </el-col>
    <el-col class="my-col" :span="2"><el-tag size="large">问题</el-tag></el-col>
    <el-col class="my-col" :span="22">
      专业无权取消下发的监考，必须要求学院管理员操作。
      <br />
    </el-col>
  </el-row>
</template>
<style scoped>
.my-col {
  margin-bottom: 10px;
}
</style>
