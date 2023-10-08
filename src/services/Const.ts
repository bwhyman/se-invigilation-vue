export const USER = 'pL6sC'
export const SUBJECT_ADMIN = 'pO8vE'
export const COLLEGE_ADMIN = 'sfLN4'
export const SUPER_ADMIN = 'UrO7n'

export const ROLES = [
  {
    name: '教师',
    value: USER
  },
  {
    name: '专业',
    value: SUBJECT_ADMIN
  },
  {
    name: '学院',
    value: COLLEGE_ADMIN
  }
]

export const IMPORT = 0
export const DISPATCH = 1
export const ASSIGN = 2

export const CLOSED = 0

export const inviStatuses: { k: number; v: string }[] = [
  { k: IMPORT, v: '导入' },
  { k: DISPATCH, v: '下发' },
  { k: ASSIGN, v: '分派' },
  { k: 5, v: '完成' }
]
