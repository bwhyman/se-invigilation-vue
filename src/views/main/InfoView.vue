<script setup lang="ts"></script>
<template>
  <el-row class="my-row">
    <el-col class="my-col" :span="2">
      <el-tag size="large">过程</el-tag>
    </el-col>
    <el-col class="my-col-content" :span="22">导入--下发--分配--通知</el-col>
    <el-col class="my-col" :span="2"><el-tag size="large">导入</el-tag></el-col>
    <el-col class="my-col-content" :span="22">
      监考为不可分割的最小单元。即，如需将一次2人监考分别下发至2个专业，需分解为2次1人监考。在表格复制一行，或通过系统监考`剪裁`功能实现。
      <br />
      导入监考请使用监考表格模板。提供2种时间模式，匹配学校下发的不同时间类型。
      <br />
      必须选择`阶段/期末`类型，才能提交。没有设置默认值，是为了避免忘记选择而误提交。
      <br />
      可手动单项录入监考。
    </el-col>
    <el-col class="my-col" :span="2"><el-tag size="large">下发</el-tag></el-col>
    <el-col class="my-col-content" :span="22">
      批量下发，多项选择监考并指定部门后，保存提交。
      <br />
      通知专业，向专业发送监考分配提醒通知。
      <br />
      剪裁，可将监考`剪裁`出一个新监考；学院可越过专业直接分配主考教师监考，同时记录为主考教师所在专业监考。
      <br />
      分配，学院可越过专业直接分配主考教师监考，同时记录为主考教师所在专业监考。
    </el-col>
    <el-col class="my-col" :span="2"><el-tag size="large">分配</el-tag></el-col>
    <el-col class="my-col-content" :span="22">
      可在功能中关闭教师分配。
      <br />
      监考分配为一个整体，只有未分配/已分配2种状态。即不支持2人次监考先分配一人，再分配另一人。强制一次性分配可有效避免遗漏。
      <br />
      分配与通知，设计为2个独立步骤便于管理。
      <br />
      分配时，显示教师监考次数，当日教师授课/监考/`排除规则`情况信息，突出显示冲突原因。提交时保存分配记录，但不发送钉钉通知。
      <br />
      可在一次监考中为同一教师分配多次，例如阶段时与研究生同时监考但记入教师次数。
      <br />
      分配后，可选择是否通知教师。
    </el-col>
    <el-col class="my-col" :span="2"><el-tag size="large">通知</el-tag></el-col>
    <el-col class="my-col-content" :span="22">
      系统以第一监考教师创建钉钉监考日程，不再由专业负责人创建，避免负责人收到非必要监考提醒。
      <br />
      系统使用钉钉工作通知+钉钉日程2种共4次通知/提醒。
      <br />
      通知方式：专业分配监考后选择发送通知，将发送2次通知：1.工作通知；2.钉钉日程确认通知。
      <br />
      提醒方式：系统同时额外设置了2次钉钉日程提醒：1.监考前一天早9点；2.监考前2小时。
      <br />
      忘记发送通知，重新分配监考给原教师，再发送通知即可。
    </el-col>
    <el-col class="my-col" :span="2"><el-tag size="large">修改</el-tag></el-col>
    <el-col class="my-col-content" :span="22">
      导入状态/下发未分配状态：学院可修改监考时间等关键信息；已分配状态：由于已下发监考通知，因此监考时间等关键信息为锁定状态禁止修改，必须重置监考(同时发送监考取消通知/取消日程)为导入状态后修改。
      <br />
      专业可像正常分配一样重新分配监考，重新分配时向原监考教师发送监考取消通知并同步取消监考日程。
      <br />
      专业无权拒绝下发的监考，欲取消请与学院协商。
      <br />
      教师无权拒绝分配的监考，欲取消请与专业协商。若教师在钉钉拒绝接受监考日程，专业负责人可收到钉钉通知，但系统仍按已分配教师记录，即系统只认专业分配，不认教师拒绝。
      <br />
      学院可在监考信息修改功能中重置监考为导入状态，再重新下发至其他专业。
    </el-col>

    <el-col class="my-col" :span="2"><el-tag size="large">功能-专业</el-tag></el-col>
    <el-col class="my-col-content" :span="22">
      关闭分配，学院可以关闭指定部门，不在下发视图中显示。
      <br />
      导出详细信息，导出包含监考数据/导入/下发/分配/通知/每教师监考次数等信息的Excel表格。
      <br />
      导入课表，导入全学院课表，以及教师单独课表。
      <br />
      重置密码，重置指定用户密码为工号。
      <br />
      更新教师部门，更新教师所在部门。
      <br />
      重置密码，重置指定用户密码为工号。
      <br />
      更新教师角色，更新教师权限角色。
    </el-col>
    <el-col class="my-col" :span="2"><el-tag size="large">功能-学院</el-tag></el-col>
    <el-col class="my-col-content" :span="22">
      关闭分配，专业可以关闭指定教师，不在分配视图中显示。
      <br />
      备注说明，添加一个说明描述，在分配视图提醒专业分配，例如王明老师周末不分配监考。
      <br />
      排除规则，基于教师/起止周/星期/节创建排除规则，包含快捷数据选项。当监考与排除规则冲突时教师将置于冲突列表，与授课冲突/监考冲突相同。
      <br />
      监考统计，专业教师监考数量统计。
    </el-col>
    <el-col class="my-col" :span="2"><el-tag size="large">学院处理</el-tag></el-col>
    <el-col class="my-col-content" :span="22">
      默认加载8日内所有监考信息，可自定义任意日期段；可通过选项卡掌握监考信息的通知/分配/下发状态；可发送提醒专业分配通知；可发送监考说明，例如大厅取卷；可导出excel表格，带字体样式，按授课教师排序/课程名称，合并剪裁的监考。
    </el-col>
    <el-col class="my-col" :span="2"><el-tag size="large">其他</el-tag></el-col>
    <el-col class="my-col-content" :span="22">
      1个监考分配同一教师2次，仅发送一次通知。
      <br />
      钉钉监考分配通知内包含系统网址，但是钉钉移动版默认使用内置浏览器打开，而钉钉内置浏览器内核版本太低不支持系统的前端技术。因此，只能使用钉钉PC版，或将网址复制使用外部浏览器打开。
    </el-col>
  </el-row>
</template>
<style scoped>
.my-col {
  text-align: right;
  padding-right: 10px;
  margin-bottom: 10px;
}
.my-col-content {
  margin-bottom: 10px;
}
</style>
