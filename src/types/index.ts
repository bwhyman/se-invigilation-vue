export interface User {
  id?: string
  name?: string
  account?: string
  password?: string
  department?: UserDepartment
  role?: string
  dingUnionId?: string
  dingUserId?: string
  mobile?: string
  inviStatus?: number
}

export interface UserDepartment {
  depId?: string
  departmentName?: string
  collId?: string
  collegeName?: string
}

export interface Department {
  id?: string
  name?: string
  college?: string
  inviStatus?: number
  dingDepid?: string
  comment?: string
}

export interface Timetable {
  id?: string
  collId?: string
  startweek?: number
  endweek?: number
  dayweek?: number
  period?: string
  course?: Course
  userId?: string
  teacherName?: string
}

export interface Course {
  courseName?: string
  location?: string
  clazz?: string
}

export interface ImportTimetable {
  name: string
  courses: Timetable[]
}

export interface Invigilation {
  id?: string
  collId?: string
  department?: UserDepartment
  date?: string
  time?: { starttime?: string; endtime?: string }
  course?: { courseName?: string; teacherName?: string; location?: string; clazz?: string }
  amount?: number
  status?: number
  importer?: { userId: string; userName: string; time: string }
  dispatcher?: { userId: string; userName: string; time: string }
  allocator?: { userId: string; userName: string; time: string }
  executor?: { userId: string; userName: string; time: string }[]
  calendarId?: string
  createUnionId?: string
  noticeUserIds?: string[]
  remark?: string
  updateTime?: string
}

export interface InviDetail {
  name?: string
  account?: string
  departmentName?: string
  count?: number
}

export interface Setting {
  id?: string
  key?: string
  value?: string
}

export interface InviCount {
  userId?: string
  count?: number
  name?: string
}

export interface InviAssignUser {
  id?: string
  name?: string
  timetables?: Timetable[]
  invis?: Invigilation[]
  amount?: number
  excludeRule?: ExcludeRule
}

export interface AssignUser {
  department?: { depId?: string; departmentName?: string }
  allocator?: { userId: string; userName: string; time: string }
  executor?: { userId: string; userName: string; time: string }[]
  users?: User[]
}

export interface DingNoticeResponse {
  errcode?: number
  errmsg?: string
  task_id?: string
  request_id?: string
}

export interface DingUser {
  unionid?: string
  userid?: string
  name?: string
  mobile?: string
}

export interface Notice {
  inviId?: string
  createUnionId?: string
  date?: string
  stime?: string
  etime?: string
  unionIds?: string[]
  noticeMessage?: string
  userIds?: string
  noticeUserIds?: string[]
  remindMinutes?: number
}

export interface NoticeRemark {
  dingUserIds: string
  remark: string
  inviIds: string[]
}

export interface Page {
  currentpage?: number
  total?: number
  url?: string
  noPage?: boolean
}

export interface ExcludeRule {
  id?: string
  depId?: string
  userId?: string
  teacherName?: string
  startweek?: number
  endweek?: number
  dayweeks?: number[]
  periods?: string[]
}

export interface ResultVO<T> {
  code: number
  message?: string
  data?: T
}
