<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { AdminService } from '@/services/AdminService'
import type { Department, User } from '@/types'
import FindCollege from './findcollege/FindCollegeVue.vue'

const selectCollegeR = ref<{ department: Department }>()
const dingDepR = ref('')
const collIdR = ref('')
const enabledR = ref(false)
const { data: collUsersR, suspense: s1 } = AdminService.getCollegeUsersService(collIdR, enabledR)
const { data: dingUsersR, suspense: s2 } = AdminService.getDingUsersService(dingDepR, enabledR)

const usersR = ref<User[]>([])
const unkownUsersR = ref<User[]>([])
watch(
  () => selectCollegeR.value?.department,
  async () => {
    const college = selectCollegeR.value?.department
    if (!college) throw '学院为空'
    collIdR.value = college.id!
    dingDepR.value = college.dingDepid!
    enabledR.value = true
    await Promise.all([s1(), s2()])
    usersR.value.length = 0
    unkownUsersR.value.length = 0

    toRaw(collUsersR.value)!.forEach((u) => {
      const dingUser = dingUsersR.value!.find((us) => us.name === u.name && us.mobile === u.mobile)
      if (!dingUser) {
        unkownUsersR.value.push(u)
      } else {
        u.dingUserId = dingUser?.userid
        u.dingUnionId = dingUser?.unionid
        usersR.value.push(u)
      }
    })
  }
)

//
const { mutateAsync } = AdminService.addCollegeUserDingsServiceX()
const addUserDingsF = async () => {
  const college = selectCollegeR.value?.department
  if (!college) return
  const users: User[] = []
  usersR.value.forEach((u) => {
    users.push({ account: u.account, dingUserId: u.dingUserId, dingUnionId: u.dingUnionId })
  })
  await mutateAsync({ collid: college.id!, users })
  createElNotificationSuccess('添加成功')
}

const exportExcelF = async () => {
  const { exportUserDingsExcel } = await import('@/services/excel/UsersExcel')
  exportUserDingsExcel(usersR.value)
}

const showExprotC = computed(() => selectCollegeR.value?.department?.id && usersR.value.length > 0)
</script>
<template>
  <el-row class="my-row">
    <el-col :span="6">
      <FindCollege ref="selectCollegeR" />
    </el-col>
    <el-col :span="6">
      <el-button type="success" @click="exportExcelF" v-if="showExprotC">导出钉钉表格</el-button>
    </el-col>
    <el-col :span="6">
      <el-button type="success" @click="addUserDingsF" v-if="showExprotC">导入钉钉信息</el-button>
    </el-col>
    <el-col>
      <el-table :data="usersR">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column>
          <template #default="scope">
            {{ scope.row.name }}
            <br />
            {{ scope.row.account }}
            <br />
            {{ scope.row.mobile }}
          </template>
        </el-table-column>
        <el-table-column>
          <template #default="scope">
            {{ scope.row.dingUnionId }}
            <br />
            {{ scope.row.dingUserId }}
          </template>
        </el-table-column>
        <el-table-column>
          <template #default="scope">
            {{ (scope.row as User).department?.departmentName }}
          </template>
        </el-table-column>
      </el-table>
    </el-col>
    <el-row>
      <el-col>以下教师提供的手机号，与钉钉群中注册不符。</el-col>
      <el-col>
        <span v-for="(unUser, index) of unkownUsersR" :key="index">
          {{ unUser.name }}({{ unUser.mobile }});
        </span>
      </el-col>
    </el-row>
  </el-row>
</template>
