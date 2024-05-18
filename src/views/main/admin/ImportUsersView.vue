<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { addUsersService, getDingUsersService, listCollegesService } from '@/services/AdminService'
import type { Department, DingUser, User } from '@/types'

const collegeR = ref<Department[]>([])
const collegeDingId = ref('')
const selectCollegeR = ref<Department>()
let dingUsersR: DingUser[] = []
const allUsersR = ref<User[]>([])
const unknownUsers: User[] = []

watch(allUsersR.value, async () => {
  if (allUsersR.value.length > 0) {
    collegeR.value = await listCollegesService()
  }
})

const activeF = async () => {
  dingUsersR = await getDingUsersService(collegeDingId.value)
  console.log(dingUsersR)
}

const readUserFile = async (event: Event) => {
  const element = event.target as HTMLInputElement
  if (!element || !element.files) {
    return
  }
  const { readUsersExcel } = await import('@/services/excel/UsersExcel')
  const eus = await readUsersExcel(element.files[0])
  dingUsersR.forEach((duser) => {
    const user: User = {}
    const excelUser = eus.find((u) => u.name == duser.name)
    if (!excelUser) {
      console.log(duser)

      unknownUsers.push(duser)
    }
    user.name = duser.name
    user.account = excelUser?.account
    // @ts-ignore
    user.department = excelUser?.department as string
    user.dingUnionId = duser.unionid
    user.dingUserId = duser.userid
    user.mobile = excelUser?.mobile
    user.role = excelUser?.role
    allUsersR.value.push(user)
  })

  if (unknownUsers.length > 0) {
    let names = ''
    unknownUsers.forEach((u) => (names += u.name + ';'))
    console.log(names)
    setTimeout(() => {
      throw `钉钉用户存在而表格不存在: ${names}`
    }, 1000)
  }
  element.value = ''
}
const addUsersF = async () => {
  await addUsersService({
    collId: selectCollegeR.value?.id!,
    collegeName: selectCollegeR.value?.name!,
    users: allUsersR.value
  })
  createElNotificationSuccess('添加用户成功')
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <el-input
        style="width: 200px; margin-right: 10px"
        v-model="collegeDingId"
        placeholder="部门编号" />
      <el-button type="success" :disabled="!collegeDingId" @click="activeF">
        获取DING部门详细用户列表
      </el-button>
      计控：
      <el-tag>228772994</el-tag>
      。结果控制台输出。
      <input type="file" @change="readUserFile" />
    </el-col>
    <el-col>
      <el-select
        v-model="selectCollegeR"
        placeholder="选择学院"
        size="large"
        style="width: 200px; margin-right: 10px">
        <el-option
          v-for="(coll, index) of collegeR"
          :key="index"
          :label="coll.name"
          :value="{ id: coll.id, name: coll.name }" />
      </el-select>
      <el-button type="success" :disabled="allUsersR.length == 0" @click="addUsersF">
        提交
      </el-button>
    </el-col>
    <el-col v-if="allUsersR.length > 0">
      <el-table :data="allUsersR" style="margin-bottom: 10px">
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
        <el-table-column prop="department" />
        <el-table-column prop="role" />
      </el-table>
    </el-col>
  </el-row>
</template>
