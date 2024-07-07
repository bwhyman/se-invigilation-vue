import type { Invigilation, User, Notice } from '@/types'
import { getInviChineseDayweek, getInviWeek } from './Utils'
import { SubjectService } from './SubjectService'
import { getSettingsService } from './CommonService'

export const noticeDingService = async (assignUsers: User[], invi: Invigilation) => {
  const notice: Notice = {
    inviId: invi.id,
    date: invi.date,
    stime: invi?.time?.starttime,
    etime: invi?.time?.endtime,
    unionIds: [],
    noticeUserIds: []
  }
  const settingsStore = await getSettingsService()
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
  // 改为监考第一名教师发起日程
  notice.createUnionId = assignUsers[0].dingUnionId
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

  const dateTime = new Date(`${invi?.date}T${invi?.time?.starttime}`)
  const x = dateTime.getTime()
  const y = x - 1000 * 60 * 60 * 24
  const z = new Date(y)
  z.setHours(9)
  const remindMinutes = (x - z.getTime()) / (1000 * 60)
  notice.remindMinutes = remindMinutes

  console.log(notice)
  const msg = await SubjectService.noticeUsersService(notice)
  return msg
}
