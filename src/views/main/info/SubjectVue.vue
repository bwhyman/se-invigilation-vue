<script setup lang="ts"></script>
<template>
  <el-row>
    <el-col class="my-col info-title" :span="2"><el-tag size="large">下发</el-tag></el-col>
    <el-col class="my-col" :span="22">学院下发监考后，专业将收到钉钉监考分配提醒通知。</el-col>
    <el-col class="my-col info-title" :span="2"><el-tag size="large">分配</el-tag></el-col>
    <el-col class="my-col" :span="22">
      监考分配为一个整体，只有未分配/已分配2种状态。即不支持2人次监考先分配一人，再分配另一人。强制一次性分配可有效避免遗漏。
      <br />
      分配与通知，设计为2个独立步骤便于管理。
      <br />
      分配时，显示教师监考次数，当日教师`授课/监考/排除规则`情况信息，突出显示冲突信息。提交时保存分配记录，但不发送钉钉通知。
      <br />
      可在一次监考中为同一教师分配多次，例如阶段时与研究生同时监考但记入教师次数。
      <br />
      可重新分配监考，重新分配时向原监考教师发送监考取消通知并同步取消监考日程。
      <br />
      分配后，可选择是否通知教师。
    </el-col>
    <el-col class="my-col info-title" :span="2"><el-tag size="large">通知</el-tag></el-col>
    <el-col class="my-col" :span="22">
      系统以第一监考教师创建钉钉监考日程，不再由专业负责人创建，避免负责人收到非必要监考提醒。
      <br />
      系统使用钉钉工作通知+钉钉日程2种共4次通知/提醒。
      <br />
      通知方式：专业分配监考后选择发送通知，将发送2次通知：1.工作通知；2.钉钉日程确认通知。
      <br />
      提醒方式：系统同时额外设置了2次钉钉日程提醒：1.监考前一天早9点后；2.监考前2小时后。
      <br />
      忘记发送通知，重新分配监考给原教师，再发送通知即可。
    </el-col>
    <el-col class="my-col info-title" :span="2"><el-tag size="large">查询</el-tag></el-col>
    <el-col class="my-col" :span="22">
      默认显示专业8日内所有监考，以紧凑样式渲染便于截图等。
      <br />
      可打开日历面板，定位任意起止日期查询。
    </el-col>
    <el-col class="my-col info-title" :span="2"><el-tag size="large">功能</el-tag></el-col>
    <el-col class="my-col" :span="22">
      关闭分配，专业可以关闭指定教师，不在分配视图中显示。
      <br />
      备注说明，添加一个说明描述，在分配视图提醒专业分配，例如王明老师周末不分配监考。
      <br />
      排除规则，基于教师/起止周/星期/节创建排除规则，包含快捷数据选项。当监考与排除规则冲突时教师将置于冲突列表，与授课冲突/监考冲突相同。
      <br />
      监考统计，专业教师监考数量统计。
    </el-col>
  </el-row>
</template>
