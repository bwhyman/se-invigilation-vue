<script setup lang="ts">
import router from '@/router'
import { CollegeService } from '@/services/CollegeService'
import { IMPORT } from '@/services/Const'
import type { Invigilation } from '@/types'
import { Edit, Scissor, SoldOut } from '@element-plus/icons-vue'

const props = defineProps<{ invi: Invigilation }>()

const editF = (invi: Invigilation) => {
  router.push(`/college/inviedit/${invi.id}`)
}

const assignF = (invi: Invigilation) => {
  const inviid = invi.id
  router.push(`/college/assigns/${inviid}`)
}

//
const { mutateAsync } = CollegeService.cutInviService()
const cutF = async (invi: Invigilation) => {
  if (invi.amount && invi.amount <= 1) {
    throw '监考人数必须大于1'
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
        collId: invi.collId,
        date: invi.date,
        time: invi.time,
        course: invi.course,
        status: IMPORT,
        importer: invi.importer
      }
      await mutateAsync({ oldInviid: invi.id!, invi: newInvi })
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
    <el-button type="primary" :icon="Edit" circle style="outline: none"></el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          :icon="Scissor"
          @click="cutF(invi)"
          v-if="invi?.amount && invi.amount > 1 && invi.status === IMPORT">
          剪裁
        </el-dropdown-item>
        <el-dropdown-item :icon="SoldOut" @click="assignF(props.invi)">分配</el-dropdown-item>
        <el-dropdown-item :icon="Edit" @click="editF(props.invi)">编辑</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
