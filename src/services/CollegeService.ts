import { useDelete, useGet, usePatch, usePost, usePut } from '@/axios'
import { createElLoadingX } from '@/components/loading'
import type {
  AssignUser,
  Department,
  DepartmentAvg,
  DingNoticeResponse,
  DingUser,
  DispatcherNotice,
  InviCount,
  Invigilation,
  NoticeRemark,
  Setting,
  Timetable,
  User,
  UserDepartment
} from '@/types'
import { querycachename } from '@/vuequery/Const'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { DISPATCH, IMPORT } from './Const'
import { stringTimetables } from './Utils'

//
const addPreUrl = (url: string) => `college/${url}`

export class CollegeService {
  //
  static listOpenedDepartmentsService() {
    return useQuery({
      queryKey: [querycachename.openeddepartments],
      queryFn: () => useGet<Department[]>(addPreUrl('departments/opened'))
    })
  }

  //
  static addInvigilationsService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (invis: Invigilation[]) => {
        invis.forEach((i) => {
          // @ts-ignore
          i.time = JSON.stringify(i.time)
          // @ts-ignore
          i.course = JSON.stringify(i.course)
          // @ts-ignore
          i.importer = JSON.stringify(i.importer)
          // @ts-ignore
          i.allocator && (i.allocator = JSON.stringify(i.allocator))
          // @ts-ignore
          i.executor && (i.executor = JSON.stringify(i.executor))
          // @ts-ignore
          i.dispatcher && (i.dispatcher = JSON.stringify(i.dispatcher))
          // @ts-ignore
          i.department && (i.department = JSON.stringify(i.department))
        })
        return usePost<Invigilation[]>(addPreUrl('invigilations'), invis)
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: [querycachename.importeds] })
    })
  }

  static listImportedService() {
    return useQuery({
      queryKey: [querycachename.importeds],
      queryFn: () => createElLoadingX(useGet<Invigilation[]>(addPreUrl('invilations/imported')))
    })
  }

  //
  static getDepatchedTotalService(depid: MaybeRefOrGetter, enabled?: MaybeRefOrGetter) {
    return useQuery({
      queryKey: [querycachename.invitotals, depid],
      queryFn: () => useGet<number>(addPreUrl(`invigilations/dispatched/${toValue(depid)}/total`)),
      enabled
    })
  }

  //
  static listDepatchedsService(
    depid: MaybeRefOrGetter,
    page: MaybeRefOrGetter,
    enabled?: MaybeRefOrGetter
  ) {
    return useQuery({
      queryKey: [querycachename.dispatcheds, depid, page],
      queryFn: () =>
        useGet<Invigilation[]>(
          addPreUrl(`invilations/dispatched/${toValue(depid)}/${toValue(page)}`)
        ),
      enabled
    })
  }

  // 清空已导入监考缓存
  static dispathInvisService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (invis: Invigilation[]) => {
        invis.forEach((i) => {
          // @ts-ignore
          i.dispatcher && (i.dispatcher = JSON.stringify(i.dispatcher))
          // @ts-ignore
          i.department && (i.department = JSON.stringify(i.department))
        })
        return usePatch<Invigilation[]>(addPreUrl('invigilations/dispatch'), invis)
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [querycachename.importeds] })
        qc.invalidateQueries({ queryKey: [querycachename.dispatcheds] })
      }
    })
  }

  //
  static listCollegeUsersService(enabled?: MaybeRefOrGetter) {
    return useQuery({
      queryKey: [querycachename.collegeusers],
      queryFn: () => createElLoadingX(useGet<User[]>(addPreUrl('users'))),
      enabled
    })
  }

  //
  static addTimetablesService() {
    return useMutation({
      mutationFn: (timetables: Timetable[]) => {
        stringTimetables(timetables)
        return createElLoadingX(usePost(addPreUrl('timetables'), timetables))
      }
    })
  }

  // 加载指定专业监考分配负责人
  static listDispatchersService(depid: string) {
    return useQuery({
      queryKey: [querycachename.dispatchers, depid],
      queryFn: () => useGet<User[]>(addPreUrl(`dispatchers/${depid}`))
    })
  }

  //
  static noticeDispatcherService() {
    return useMutation({
      mutationFn: (notice: DispatcherNotice) =>
        usePost<DingNoticeResponse>(addPreUrl('dispatchnotices'), notice)
    })
  }

  //
  static addTimetableService() {
    return useMutation({
      mutationFn: ({ userid, timetables }: { userid: string; timetables: Timetable[] }) => {
        stringTimetables(timetables)
        return usePost(addPreUrl(`timetables/${userid}`), timetables)
      }
    })
  }

  //
  static updateInviService() {
    const qc = useQueryClient()
    let status = 0
    return useMutation({
      mutationFn: (invi: Invigilation) => {
        // 用于决定更新哪组数据
        status = invi.status!
        // @ts-ignore
        invi.time = JSON.stringify(invi.time)
        // @ts-ignore
        invi.course = JSON.stringify(invi.course)
        //
        invi.importer = undefined
        invi.dispatcher = undefined
        invi.executor = undefined
        invi.collId = undefined
        invi.department = undefined
        invi.dingNotice = undefined
        invi.remark = undefined
        return usePatch(addPreUrl('invigilations/edit'), toValue(invi))
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [querycachename.currentinvi] })
        if (status === IMPORT) {
          qc.invalidateQueries({ queryKey: [querycachename.importeds] })
        } else if (status === DISPATCH) {
          qc.invalidateQueries({ queryKey: [querycachename.dispatcheds] })
        }
      }
    })
  }

  // 删除监考
  static delInviService(status: number) {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (inviid: string) => useDelete(addPreUrl(`invigilations/${inviid}`)),
      onSuccess: () => {
        if (status === IMPORT) {
          qc.invalidateQueries({ queryKey: [querycachename.importeds] })
        } else if (status === DISPATCH) {
          qc.invalidateQueries({ queryKey: [querycachename.dispatcheds] })
        }
      }
    })
  }

  // 重置监考为未下发状态，重置信息等
  static resetInviService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (inviid: string) => usePut(addPreUrl(`invigilations/${inviid}/status`)),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [querycachename.importeds] })
        qc.invalidateQueries({ queryKey: [querycachename.dispatcheds] })
      }
    })
  }

  //
  static listDepartmentsService(enabled?: MaybeRefOrGetter) {
    return useQuery({
      queryKey: [querycachename.departments],
      queryFn: () => useGet<Department[]>(addPreUrl('departments')),
      enabled
    })
  }

  //
  static updateDepartmentInviStatusService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (departs: Department[]) =>
        usePatch<Department[]>(addPreUrl('departments/invistatus'), departs),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [querycachename.openeddepartments] })
        qc.invalidateQueries({ queryKey: [querycachename.departments] })
      }
    })
  }

  // 学院直接分配
  static addAssignService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: ({ inviid, user }: { inviid: string; user: AssignUser }) => {
        // @ts-ignore
        user.allocator = JSON.stringify(user.allocator)
        // @ts-ignore
        user.executor = JSON.stringify(user.executor)
        // @ts-ignore
        user.dispatcher = JSON.stringify(user.dispatcher)
        // @ts-ignore
        user.department = JSON.stringify(user.department)
        return usePost<Invigilation>(`invidetails/${inviid}`, user)
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [querycachename.importeds] })
        qc.invalidateQueries({ queryKey: [querycachename.dispatcheds] })
      }
    })
  }

  //
  static listCollegeInviDetailsService(enabled?: MaybeRefOrGetter) {
    return useQuery({
      queryKey: [querycachename.collegeallinvis],
      queryFn: () => useGet<Invigilation[]>(addPreUrl('invis/all')),
      enabled
    })
  }

  // 获取全学院每位教师监考数量
  static listCollegeCountsService(enabled?: MaybeRefOrGetter) {
    return useQuery({
      queryKey: [querycachename.collegeusersinvicounts],
      queryFn: () => useGet<InviCount[]>(addPreUrl('invis/counts')),
      enabled
    })
  }

  // 重置指定账号密码
  static resetPasswordService() {
    return useMutation({
      mutationFn: (account: string) => usePut(addPreUrl(`passwords/${account}`))
    })
  }

  //
  static addUserService() {
    return useMutation({
      mutationFn: (user: User) => {
        // @ts-ignore
        user.department = JSON.stringify(user.department)
        return usePost(addPreUrl('users'), user)
      }
    })
  }

  //
  static sendInviRemarkNoticeService() {
    return useMutation({
      mutationFn: (notice: NoticeRemark) =>
        createElLoadingX(usePost<{ request_id: string }>(addPreUrl('invinotices'), notice))
    })
  }

  // 获取指定学院，指定id的监考信息
  static getCollegeInviService(inviid: string) {
    return useQuery({
      queryKey: [querycachename.currentinvi],
      queryFn: () => useGet<Invigilation>(addPreUrl(`invis/${inviid}`)),
      gcTime: 0
    })
  }

  // 清空已导入监考缓存
  static cutInviService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: ({ oldInviid, invi }: { oldInviid: string; invi: Invigilation }) => {
        // @ts-ignore
        invi.importer = JSON.stringify(invi.importer)
        // @ts-ignore
        invi.course = JSON.stringify(invi.course)
        // @ts-ignore
        invi.time = JSON.stringify(invi.time)
        return usePost(addPreUrl(`cutinvigilation/${oldInviid}`), invi)
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [querycachename.importeds] })
        qc.invalidateQueries({ queryKey: [querycachename.dispatcheds] })
        qc.invalidateQueries({ queryKey: [querycachename.invitotals] })
        qc.invalidateQueries({ queryKey: [querycachename.dateinvis] })
      }
    })
  }

  // 加载指定专业下全部教师
  static listDepartmentUsersService(depid: MaybeRefOrGetter, enabled?: MaybeRefOrGetter) {
    return useQuery({
      queryKey: [querycachename.departusers, depid],
      queryFn: () => useGet<User[]>(addPreUrl(`departments/${toValue(depid)}/users`)),
      enabled
    })
  }

  // 基于钉钉注册手机号，获取用户信息
  static getDingUserService(mobile: MaybeRefOrGetter, enabled?: MaybeRefOrGetter) {
    return useQuery({
      queryKey: [],
      queryFn: () => createElLoadingX(useGet<DingUser>(addPreUrl(`mobiles/${toValue(mobile)}`))),
      enabled
    })
  }

  //
  static removeUserService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (uid: string) => useDelete(addPreUrl(`users/${uid}`)),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [querycachename.collegeusers] })
        qc.invalidateQueries({ queryKey: [querycachename.collegeusersinvicounts] })
        qc.invalidateQueries({ queryKey: [querycachename.departusers] })
        qc.invalidateQueries({ queryKey: [querycachename.dingusers] })
      }
    })
  }

  //
  static removeCollegeDataService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: () => createElLoadingX(useDelete(addPreUrl('datareset'))),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [querycachename.importeds] })
        qc.invalidateQueries({ queryKey: [querycachename.dispatcheds] })
        qc.invalidateQueries({ queryKey: [querycachename.assigneds] })
        qc.invalidateQueries({ queryKey: [querycachename.collegeallinvis] })
        qc.invalidateQueries({ queryKey: [querycachename.departavgs] })
        qc.invalidateQueries({ queryKey: [querycachename.collegeusersinvicounts] })
      }
    })
  }

  //
  static removeDepartmentService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (depid: string) => useDelete<Department[]>(addPreUrl(`departments/${depid}`)),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [querycachename.departments] })
        qc.invalidateQueries({ queryKey: [querycachename.openeddepartments] })
      }
    })
  }

  // 更新部门名称
  static updateDepartmentNameService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (depart: UserDepartment) =>
        usePatch<Department[]>(addPreUrl(`departments/${depart.depId}`), depart),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [querycachename.departments] })
        qc.invalidateQueries({ queryKey: [querycachename.openeddepartments] })
      }
    })
  }

  //
  static updateUserSerivce() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (user: User) => {
        // @ts-ignore
        user.department = JSON.stringify(user.department)
        return usePatch(addPreUrl(`users/${user.id}`), user)
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [querycachename.collegeusers] })
        qc.invalidateQueries({ queryKey: [querycachename.departusers] })
      }
    })
  }

  //
  static addDepartmentService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (depart: Department) => {
        // @ts-ignore
        depart.college = JSON.stringify(depart.college)
        return usePost(addPreUrl('departments'), depart)
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [querycachename.departments] })
        qc.invalidateQueries({ queryKey: [querycachename.openeddepartments] })
      }
    })
  }

  //
  static listDepartmentAvgsService(enabled: MaybeRefOrGetter) {
    return useQuery({
      queryKey: [querycachename.departavgs],
      queryFn: async () => {
        const data = await useGet<{
          departmentquantity: DepartmentAvg[]
          teacherquantity: DepartmentAvg[]
        }>(addPreUrl('invis/avg'))
        const depAvgMap = new Map<string, string>()
        data.departmentquantity.map((dep) => {
          const teacherQuantity =
            data.teacherquantity.find((dept) => dept.depId === dep.depId)?.teacherQuantity ?? 1
          depAvgMap.set(dep.depId!, ((dep.departmentQuantity ?? 1) / teacherQuantity).toFixed(1))
        })
        return depAvgMap
      },
      enabled
    })
  }

  //
  static updateSettingService() {
    const qc = useQueryClient()
    return useMutation({
      mutationKey: [querycachename.settings],
      mutationFn: (setting: Setting) => usePost(addPreUrl('settings'), setting),
      onSuccess: () => qc.invalidateQueries({ queryKey: [querycachename.settings] })
    })
  }
}
