<script setup lang="ts">
import type { ExcludeRule } from '@/types'
import { dayOfWeeksC, periodOfDaysC } from '@/services/ExcludeRule'
import { SubjectService } from '@/services/SubjectService'
import { render } from 'vue'
import { createElNotificationSuccess } from '@/components/message'

const props = defineProps<{ rule: ExcludeRule }>()
const delDialVisable = ref(true)

const delConfirmF = async () => {
  await SubjectService.delExcludeRuleService(props.rule.id!)
  createElNotificationSuccess('规则删除成功')
  close()
}
const close = () => render(null, document.body)
</script>
<template>
  <el-dialog v-model="delDialVisable" title="确认" @close="close">
    <p style="margin-bottom: 10px">确认删除本条规则？</p>
    <p>
      {{ props.rule.teacherName }} / {{ props.rule.startweek }} - {{ props.rule.endweek }}周 /
      {{ dayOfWeeksC(props.rule.dayweeks!) }} / {{ periodOfDaysC(props.rule.periods!) }}
    </p>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="delConfirmF">Confirm</el-button>
      </span>
    </template>
  </el-dialog>
</template>
