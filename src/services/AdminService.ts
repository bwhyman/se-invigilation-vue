import { useGet, usePatch, usePost } from '@/axios'
import type { Department, DingUser, Setting, User } from '@/types'
import { querycachename } from '@/vuequery/Const'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'

const addPreUrl = (url: string) => `admin/${url}`

export class AdminService {
  //
  static addCollegeService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (dep: Department) => {
        dep.root = 1
        return usePost(addPreUrl('colleges'), dep)
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: [querycachename.colleges] })
    })
  }

  //
  static listCollegesService() {
    return useQuery({
      queryKey: [querycachename.colleges],
      queryFn: () => useGet<Department[]>(addPreUrl('colleges'))
    })
  }

  static addUsersService() {
    return useMutation({
      mutationFn: ({
        collId,
        collegeName,
        users
      }: {
        collId: string
        collegeName: string
        users: User[]
      }) => usePost(addPreUrl('users'), { collId, collegeName, users })
    })
  }

  //
  static getDingUsersService(dingdepid: MaybeRefOrGetter, enabled?: MaybeRefOrGetter) {
    return useQuery({
      queryKey: [querycachename.dingusers, dingdepid],
      queryFn: () => useGet<DingUser[]>(addPreUrl(`dingusers/${toValue(dingdepid)}`)),
      enabled
    })
  }

  //
  static getCollegeUsersService(collidR: MaybeRefOrGetter, enabled?: MaybeRefOrGetter) {
    return useQuery({
      queryKey: [querycachename.collegeusers, collidR],
      queryFn: () => useGet<User[]>(addPreUrl(`colleges/${toValue(collidR)}/users`)),
      enabled
    })
  }

  //
  static addCollegeUserDingsServiceX() {
    //await usePost(addPreUrl(`colleges/${collid}/userdings`), users)
    return useMutation({
      mutationFn: ({ collid, users }: { collid: string; users: User[] }) =>
        usePost(addPreUrl(`colleges/${collid}/userdings`), users)
    })
  }

  static updateSettingService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (setting: Setting) => usePatch(addPreUrl('settings'), setting),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [querycachename.settings] })
      }
    })
  }
}
