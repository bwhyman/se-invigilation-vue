import { getInviChineseDayweek, getInviWeek } from '@/services/Utils'
import type { Invigilation, Notice, User } from '@/types'

// 创建初始化的通知对象
export const getInitNotice = (users: User[], invis: Invigilation, dayOfFirstWeek: string) => {
  const notice: Notice = {
    inviId: invis.id,
    date: invis.date,
    stime: invis.time?.starttime,
    etime: invis.time?.endtime,
    unionIds: [],
    noticeUserIds: []
  }
  const week = getInviWeek(notice.date!, dayOfFirstWeek)
  const dayweek = getInviChineseDayweek(notice.date!)
  const userNames: string[] = []
  users.forEach((u) => {
    userNames.push(u.name!)
  })

  const noticeMessage = `监考时间: ${notice.date}第${week}周${dayweek} ${notice.stime}~${
    notice.etime
  }
监考课程：${invis.course?.courseName}
监考地点：${invis.course?.location}
监考教师：${userNames.join('; ')}`
  notice.noticeMessage = noticeMessage
  if (invis.calendarId != null) {
    throw `请勿重复发送通知。如需更改请返回分配页面重新分配监考`
  }

  // 计算监考前一天9点
  const x = new Date(`${invis.date}T${invis.time?.starttime}`).getTime()
  const y = x - 1000 * 60 * 60 * 24
  const z = new Date(y)
  z.setHours(9)
  z.setMinutes(0)
  z.setSeconds(0)
  const remindMinutes = (x - z.getTime()) / (1000 * 60)
  notice.remindMinutes = remindMinutes
  return notice
}

// 更新通知用户情况，追加数据
export const getFinalNotice = (notice: Notice, users: User[]) => {
  const userIds: string[] = []
  users.forEach((u) => {
    notice.noticeUserIds?.push(u.id!)
    notice.unionIds?.push(u.dingUnionId!)
    userIds.push(u.dingUserId!)
  })
  // 改为监考第一名教师发起日程
  notice.createUnionId = users[0].dingUnionId
  // @ts-ignore
  notice.noticeUserIds = JSON.stringify(notice.noticeUserIds)
  notice.userIds = userIds.join(',')
  return notice
}
