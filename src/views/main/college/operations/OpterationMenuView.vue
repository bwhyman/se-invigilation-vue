<script setup lang="ts">
import router from '@/router'
import { cutInviService } from '@/services/CollegeService'
import { IMPORT } from '@/services/Const'
import { useInvigilationsStore } from '@/stores/InvigilationsStore'
import { useMessageStore } from '@/stores/MessageStore'
import type { Invigilation } from '@/types'
import { Scissor, Edit, SoldOut } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const props = defineProps<{ invi: Invigilation }>()
const messageStore = useMessageStore()

//
const editF = () => {
  router.push(`/college/inviedit/${props.invi.id}`)
  useInvigilationsStore().currentInviS = props.invi
}

const assignF = () => {
  if (props.invi.amount != 1) {
    storeToRefs(useMessageStore()).messageS.value = '只能为监考人数为1的监考直接分配'
    return
  }
  storeToRefs(useInvigilationsStore()).currentInviS.value = props.invi
  const name = props.invi.course?.teacherName
  const inviid = props.invi.id
  router.push(`/college/assigns/${inviid}/names/${name}`)
}

//
const cutF = async () => {
  if (props.invi.amount && props.invi.amount <= 1) {
    storeToRefs(messageStore).messageS.value = '监考人数必须大于1'
    return
  }

  ElMessageBox.confirm('从当前监考剪裁一份新监考？', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  })
    .then(async () => {
      ElMessage({
        type: 'success',
        message: 'Completed'
      })
      const newInvi: Invigilation = {
        amount: 1,
        collId: props.invi.collId,
        date: props.invi.date,
        time: props.invi.time,
        course: props.invi.course,
        status: IMPORT,
        importer: props.invi.importer
      }
      await cutInviService(props.invi.id!, newInvi)
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: 'Canceled'
      })
    })
}
</script>
<template>
  <el-dropdown>
    <el-button type="primary" :icon="Edit" circle></el-button>
    <!-- <el-icon color="#409EFF" :size="20"><Edit /></el-icon> -->
    <template #dropdown>
      <el-dropdown-menu>
        <template v-if="props.invi.amount! > 1">
          <el-dropdown-item :icon="Scissor" @click="cutF">剪裁</el-dropdown-item>
        </template>

        <template v-if="props.invi.amount == 1">
          <el-dropdown-item :icon="SoldOut" @click="assignF">分配</el-dropdown-item>
        </template>

        <el-dropdown-item :icon="Edit" @click="editF">编辑</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
