import type { Invigilation, User, Notice } from '@/types'
import { getInviChineseDayweek, getInviWeek } from './Utils'
import { useSettingStore } from '@/stores/SettingStore'
import { noticeUsersService } from './SubjectService'

export const noticeDingService = async (
  createUser: User,
  assignUsers: User[],
  invi: Invigilation
) => {
  const notice: Notice = {
    inviId: invi.id,
    createUnionId: createUser.dingUnionId,
    date: invi.date,
    stime: invi?.time?.starttime,
    etime: invi?.time?.endtime,
    unionIds: [],
    noticeUserIds: []
  }
  const settingsStore = useSettingStore()
  const week = getInviWeek(notice.date!, settingsStore.getFirstWeek())
  const dayweek = getInviChineseDayweek(notice.date!)

  const userIds: string[] = []
  const userNames: string[] = []
  assignUsers.forEach((u) => {
    notice.noticeUserIds?.push(u.id!)
    notice.unionIds?.push(u.dingUnionId!)
    userIds.push(u.dingUserId!)
    userNames.push(u.name!)
  })
  // @ts-ignore
  notice.noticeUserIds = JSON.stringify(notice.noticeUserIds)
  notice.userIds = userIds.join(',')

  const noticeMessage = `监考时间: ${notice.date}第${week}周${dayweek} ${notice.stime}~${
    notice.etime
  }
监考课程：${invi?.course?.courseName}
监考地点：${invi?.course?.location}
监考教师：${userNames.join('; ')}`
  notice.noticeMessage = noticeMessage

  console.log(notice)

  const msg = await noticeUsersService(notice)
  return msg
}
