<script setup lang="ts">
import router from '@/router'
import {
  addAssignService,
  getCollegeInviService,
  getUserByNameServie,
  listDepartmentUsersService,
  listDepartmentsService,
  updateInvisService
} from '@/services/CollegeService'
import { getSettingsService, noticeDingCancelService } from '@/services/CommonService'
import { stringInviTime } from '@/services/Utils'
import { useUserStore } from '@/stores/UserStore'
import type { AssignUser, Department, Invigilation, User } from '@/types'
import InviMessage from '../component/InviInfo.vue'
import { createMessageDialog } from '@/components/message'

const props = defineProps<{ inviid: string; name: string }>()

const results = await Promise.all([
  getCollegeInviService(props.inviid),
  getUserByNameServie(props.name),
  getSettingsService()
])

const inviR = results[0]
if (!inviR) {
  const msg = '获取监考信息错误!'
  createMessageDialog(msg)
  throw new Error(msg)
}
const usersR = ref<User[]>([])
const selectUserR = ref<string>()
const departmentR = ref('')
usersR.value = results[1]

const departmentsR = ref<Department[]>()
const selfSearchR = ref(false)

watch(departmentR, async () => {
  selectUserR.value = undefined
  usersR.value = await listDepartmentUsersService(departmentR.value)
})

const createUserR = useUserStore().userS

const assignF = async () => {
  const user = usersR.value.find((u) => u.id == selectUserR.value)

  const invi: Invigilation = { id: inviR.id }
  invi.department = {
    depId: user?.department?.depId,
    departmentName: user?.department?.departmentName
  }
  invi.dispatcher = stringInviTime({ id: createUserR.id, name: createUserR.name })
  await updateInvisService([invi])
  const assignUser: AssignUser = { executor: [], users: [] }
  assignUser.department = {
    depId: user?.department?.depId,
    departmentName: user?.department?.departmentName
  }
  assignUser.allocator = stringInviTime({ id: createUserR.id, name: createUserR.name })
  assignUser.executor?.push(stringInviTime({ id: user?.id, name: user?.name }))
  assignUser.users?.push({ id: user?.id, name: user?.name })

  await noticeDingCancelService(invi!.id!)
  await addAssignService(inviR.id!, assignUser)
  createMessageDialog('提交成功', () => {
    router.push(`/college/invinotice/${inviR.id}`)
  })
}
const searchF = async () => {
  if (selfSearchR.value) return
  selfSearchR.value = true
  selectUserR.value = undefined
  usersR.value.length = 0
  departmentsR.value = await listDepartmentsService()
}
</script>
<template>
  <el-row class="my-row">
    <el-col style="text-align: center">
      <InviMessage :invi="inviR" />
    </el-col>
  </el-row>
  <el-row class="my-row">
    <el-col>
      <el-button type="primary" style="margin-bottom: 10px" @click="searchF">
        手动检索分配
      </el-button>
    </el-col>
    <el-col style="margin-bottom: 10px" v-if="!selfSearchR">
      <p v-if="usersR.length == 0">
        未找到
        <el-tag type="danger">{{ props.name }}</el-tag>
        教师，请手动检索分配
      </p>
      <el-radio-group v-model="selectUserR" v-if="usersR.length > 0">
        <el-radio v-for="(u, index) of usersR" :key="index" :label="u.id" size="large" border>
          {{ u?.name }} / {{ u?.account }} / {{ u?.department?.departmentName }}
        </el-radio>
      </el-radio-group>
    </el-col>
    <el-col style="margin-bottom: 10px" v-if="selfSearchR">
      <el-select
        v-model="departmentR"
        placeholder="选择部门"
        size="large"
        style="width: 250px; margin-bottom: 10px">
        <el-option
          v-for="(depart, index) of departmentsR"
          :key="index"
          :label="depart.name"
          :value="depart.id" />
      </el-select>
      <br />
      <el-radio-group v-model="selectUserR">
        <el-radio
          style="width: 220px"
          v-for="(u, index) of usersR"
          :key="index"
          :label="u.id"
          size="large"
          border>
          {{ u?.name }} / {{ u?.account }}
          <br />
        </el-radio>
      </el-radio-group>
    </el-col>
    <el-col>
      <el-button type="success" @click="assignF" :disabled="!selectUserR">提交</el-button>
    </el-col>
  </el-row>
</template>
