import router from '@/router'
import { CollegeService } from '@/services/CollegeService'
import { CommonService } from '@/services/CommonService'
import { IMPORT } from '@/services/Const'
import type { Invigilation } from '@/types'

//
export const editF = (invi: Invigilation) => {
  router.push(`/college/inviedit/${invi.id}`)
  CommonService.setCurrentInviService(invi)
}

export const assignF = (invi: Invigilation) => {
  CommonService.setCurrentInviService(invi)
  const inviid = invi.id
  router.push(`/college/assigns/${inviid}`)
}

//
export const cutF = async (invi: Invigilation) => {
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
      await CollegeService.cutInviService(invi.id!, newInvi)
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: 'Canceled'
      })
    })
}
