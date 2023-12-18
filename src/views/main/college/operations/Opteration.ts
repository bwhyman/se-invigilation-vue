import { createMessageDialog } from '@/components/message'
import router from '@/router'
import { cutInviService } from '@/services/CollegeService'
import { IMPORT } from '@/services/Const'
import { useInvigilationsStore } from '@/stores/InvigilationsStore'
import type { Invigilation } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'

//
export const editF = (invi: Invigilation) => {
  router.push(`/college/inviedit/${invi.id}`)
  useInvigilationsStore().currentInviS = invi
}

export const assignF = (invi: Invigilation) => {
  if (invi.amount != 1) {
    createMessageDialog('只能为监考人数为1的监考直接分配')
    return
  }
  storeToRefs(useInvigilationsStore()).currentInviS.value = invi
  const name = invi.course?.teacherName
  const inviid = invi.id
  router.push(`/college/assigns/${inviid}/names/${name}`)
}

//
export const cutF = async (invi: Invigilation) => {
  if (invi.amount && invi.amount <= 1) {
    createMessageDialog('监考人数必须大于1')
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
        collId: invi.collId,
        date: invi.date,
        time: invi.time,
        course: invi.course,
        status: IMPORT,
        importer: invi.importer
      }
      await cutInviService(invi.id!, newInvi)
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: 'Canceled'
      })
    })
}
