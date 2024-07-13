import { DISPATCH } from '@/services/Const'
import { stringInviTime } from '@/services/Utils'
import type { AssignUser, Invigilation, User } from '@/types'

// 相同监考，修改分配
export const createAssign = (selectUsers: User[], createUser: User) => {
  const assignUser: AssignUser = {}
  assignUser.department = {
    depId: selectUsers[0].department?.depId,
    departmentName: selectUsers[0].department?.departmentName
  }
  assignUser.amount = selectUsers.length
  assignUser.dispatcher = stringInviTime(createUser)
  assignUser.allocator = stringInviTime(createUser)
  assignUser.executor = []
  assignUser.userIds = []
  for (const selUser of selectUsers) {
    assignUser.executor.push(stringInviTime(selUser))
    assignUser.userIds.push(selUser.id!)
  }
  return assignUser
}

// 创建新监考
export const createInvis = (oldInvi: Invigilation, createUser: User, selUsers: User[]) => {
  const invis: Invigilation[] = []
  for (const user of selUsers) {
    const inviN: Invigilation = {}
    inviN.collId = createUser.department?.collId
    inviN.department = {
      depId: user.department?.depId,
      departmentName: user.department?.departmentName
    }
    inviN.importer = stringInviTime(createUser)
    inviN.dispatcher = stringInviTime(createUser)
    inviN.date = oldInvi.date
    inviN.time = oldInvi.time
    inviN.course = oldInvi.course
    inviN.amount = 1
    inviN.status = DISPATCH
    invis.push(inviN)
  }
  return invis
}

// 多监考创建分配
export const createAssigns = (createUser: User, selectUsers: User[], invis: Invigilation[]) => {
  const asses: AssignUser[] = []
  for (let index = 0; index < invis.length; index++) {
    const uss: string[] = []
    const dep = selectUsers[index].department
    const allocator = stringInviTime(createUser)
    const executor = [stringInviTime(selectUsers[index])]
    uss.push(selectUsers[index].id!)
    const u: AssignUser = {
      department: dep,
      allocator: allocator,
      executor: executor,
      userIds: uss
    }
    asses.push(u)
  }
  return asses
}
