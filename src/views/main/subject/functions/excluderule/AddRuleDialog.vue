<script setup lang="ts">
import { addExcludeRuleService, listUsersService } from '@/services/SubjectService'
import type { ExcludeRule, User } from '@/types'
import { Plus } from '@element-plus/icons-vue'
import { dayOfWeeks, periodOfDays } from '@/services/ExcludeRule'
import { createElNotificationSuccess } from '@/components/message'

const dialogFormVisible = ref(false)
const usersR = ref<User[]>([])
const excludeRuleR = ref<ExcludeRule>({})

const openDialogF = async () => {
  dialogFormVisible.value = true
  usersR.value = (await listUsersService()).value
}
const closedialF = () => {
  excludeRuleR.value = {}
}

const dayOfWeekR = ref(0)
const peroidOfDayR = ref(0)
const weeksR = ref(0)

const weeksRadioChangeF = () => {
  switch (weeksR.value) {
    case 1:
      excludeRuleR.value.startweek = 1
      excludeRuleR.value.endweek = 10
      break
    case 2:
      excludeRuleR.value.startweek = 11
      excludeRuleR.value.endweek = 23
      break
    case 3:
      excludeRuleR.value.startweek = 1
      excludeRuleR.value.endweek = 23
      break
  }
}

const dayofWeekRadioChangeF = () => {
  switch (dayOfWeekR.value) {
    case 1:
      excludeRuleR.value.dayweeks = [1, 2, 3, 4, 5]
      break
    case 2:
      excludeRuleR.value.dayweeks = [6, 7]
      break
    case 3:
      excludeRuleR.value.dayweeks = [1, 2, 3, 4, 5, 6, 7]
      break
  }
}

const periodOfDayChangeF = () => {
  switch (peroidOfDayR.value) {
    case 1:
      excludeRuleR.value.periods = ['12']
      break
    case 2:
      excludeRuleR.value.periods = ['78', '910', '1112']
      break
    case 3:
      excludeRuleR.value.periods = ['12', '78', '910', '1112']
      break
    case 4:
      excludeRuleR.value.periods = ['12', '34', '56', '78', '910', '1112']
      break
  }
}

const submitF = async () => {
  if (!excludeRuleR.value.userId || excludeRuleR.value.userId?.length == 0) {
    throw '教师不能为空'
  }
  if (excludeRuleR.value.startweek! > excludeRuleR.value.endweek!) {
    throw '开始周不能小于结束周'
  }
  excludeRuleR.value.teacherName = usersR.value.find((u) => u.id == excludeRuleR.value.userId)?.name
  dialogFormVisible.value = false

  const rule: ExcludeRule = JSON.parse(JSON.stringify(excludeRuleR.value))
  await addExcludeRuleService(rule)
  createElNotificationSuccess('规则添加成功')
}
</script>
<template>
  <div>
    <el-button type="primary" @click="openDialogF" :icon="Plus" />
    <el-dialog v-model="dialogFormVisible" title="添加排除规则" @close="closedialF">
      <p style="margin-bottom: 10px">
        说明：可以使用快捷选项迅速设置数据，也可单独选择具体数据。例如直接选择星期或节。
        <br />
        规则：相同起止周/星期/节为一个规则。例如教师工作日早晚排除；但该教师周末全天也需排除，则需创建一个新规则。
      </p>
      <el-form :model="excludeRuleR" label-width="60px">
        <el-form-item label="教师">
          <el-select v-model="excludeRuleR!.userId" placeholder="教师" size="large">
            <el-option
              v-for="(user, index) of usersR"
              :key="index"
              :label="user.name"
              :value="user.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="起止周">
          <div style="display: flex; flex-direction: column">
            <el-radio-group
              @change="weeksRadioChangeF"
              v-model="weeksR"
              style="margin-bottom: 10px">
              <el-radio-button :label="1">上半学期</el-radio-button>
              <el-radio-button :label="2">下半学期</el-radio-button>
              <el-radio-button :label="3">整学期</el-radio-button>
            </el-radio-group>
            <div>
              <el-input-number
                v-model="excludeRuleR.startweek"
                :min="1"
                :max="23"
                @change="weeksR = 0" />
              <el-input-number
                v-model="excludeRuleR.endweek"
                :min="1"
                :max="23"
                @change="weeksR = 0" />
            </div>
          </div>
        </el-form-item>

        <el-form-item label="星期">
          <div style="display: flex; flex-direction: column">
            <el-radio-group
              @change="dayofWeekRadioChangeF"
              v-model="dayOfWeekR"
              style="margin-bottom: 10px">
              <el-radio-button :label="1">工作日</el-radio-button>
              <el-radio-button :label="2">周末</el-radio-button>
              <el-radio-button :label="3">整周</el-radio-button>
            </el-radio-group>
            <el-checkbox-group v-model="excludeRuleR.dayweeks" size="large">
              <el-checkbox-button
                @click="dayOfWeekR = 0"
                v-for="dweek in dayOfWeeks"
                :key="dweek"
                :label="dweek.value">
                {{ dweek.name }}
              </el-checkbox-button>
            </el-checkbox-group>
          </div>
        </el-form-item>
        <el-form-item label="节">
          <div style="display: flex; flex-direction: column">
            <el-radio-group
              @change="periodOfDayChangeF"
              v-model="peroidOfDayR"
              style="margin-bottom: 10px">
              <el-radio-button :label="1">早</el-radio-button>
              <el-radio-button :label="2">晚</el-radio-button>
              <el-radio-button :label="3">早晚</el-radio-button>
              <el-radio-button :label="4">全天</el-radio-button>
            </el-radio-group>
            <el-checkbox-group v-model="excludeRuleR.periods" size="large">
              <el-checkbox-button
                @click="peroidOfDayR = 0"
                v-for="period in periodOfDays"
                :key="period"
                :label="period.value">
                {{ period.name }}
              </el-checkbox-button>
            </el-checkbox-group>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button @click="submitF" type="success" :disabled="!excludeRuleR.userId">
            提交
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
