import { getInviChineseDayweek, getInviWeek } from '@/services/Utils'
import type { DingCalendar, Invigilation, Notice, User } from '@/types'

// 创建初始化的通知对象
export const getInitNotice = (users: User[], invis: Invigilation) => {
  const notice: Notice = {
    inviId: invis.id,
    date: invis.date,
    stime: invis.time?.starttime,
    etime: invis.time?.endtime
  }
  const week = getInviWeek(notice.date!)
  const dayweek = getInviChineseDayweek(notice.date!)
  const userNames: string[] = []
  users.forEach((u) => {
    userNames.push(u.name!)
  })

  const noticeMessage = `监考时间: ${notice.date}第${week}周${dayweek} ${notice.stime}~${
    notice.etime
  }
监考课程：${invis.course?.courseName}
监考班级：${invis.course?.clazz}
监考地点：${invis.course?.location}
监考教师：${userNames.join('; ')}`
  notice.noticeMessage = noticeMessage

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
  const dingIds: string[] = []
  const calendars: DingCalendar[] = []

  users.forEach((u) => {
    userIds.push(u.id!)
    dingIds.push(u.dingUserId!)
    calendars.push({ unionId: u.dingUnionId })
  })
  // dingIds，直接转分割的字符串。利于后端直接处理
  notice.dingNotice = { userIds: userIds, dingIds: dingIds.join(','), calendars: calendars }

  return notice
}
