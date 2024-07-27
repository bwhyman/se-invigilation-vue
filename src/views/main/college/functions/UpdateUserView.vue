<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import { ROLES } from '@/services/Const'
import { useUserStore } from '@/stores/UserStore'
import type { Department, User, UserDepartment } from '@/types'
import DepartmentUser from './finduser/DepartmentUser.vue'

const exposeR = ref<{ selectUser: User; clearUser: Function }>()
const userR = ref<User>({})
const departmentR = ref<Department>()
const departmentsR = ref<Department[]>([])
const userS = useUserStore().userS
watch(
  () => exposeR.value?.selectUser,
  async () => {
    userR.value = exposeR.value?.selectUser!
    departmentsR.value = (await CollegeService.listDepartmentsService()).value
  }
)
//
const resetPasswordF = async () => {
  await CollegeService.resetPasswordService(userR.value.account!)
  createElNotificationSuccess('密码重置成功')
  exposeR.value?.clearUser()
}

//
const updateDepartmentF = async () => {
  if (!userS.value) return
  const depart = departmentsR.value.find((d) => d.id == departmentR.value?.id)
  if (!depart) {
    throw '选择部门错误'
  }
  const dep: UserDepartment = {
    collId: userS.value.department?.collId,
    collegeName: userS.value.department?.collegeName,
    depId: depart.id,
    departmentName: depart.name
  }
  const user: User = { id: userR.value?.id, department: dep }
  await CollegeService.updateUserDepartmentService(user)
  createElNotificationSuccess('部门更新成功')
  exposeR.value?.clearUser()
}
//
const roleR = ref('')
const updateUserRoleF = async () => {
  const u: User = {}
  u.id = userR.value?.id
  u.role = roleR.value
  await CollegeService.updateUserRoleService(u)
  createElNotificationSuccess('角色更新成功')
  exposeR.value?.clearUser()
}

//
const removeUserF = () => {
  if (!userR.value.id) {
    throw '用户为空，请选择用户'
  }
  ElMessageBox.confirm(`移除用户 ${userR.value?.name}，确定移除？`, 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  }).then(async () => {
    userR.value?.id && (await CollegeService.removeUserService(userR.value.id))
    createElNotificationSuccess('用户移除成功')
    exposeR.value?.clearUser()
  })
}

//
const updateUserInfoF = async () => {
  const user: User = {
    id: userR.value.id,
    name: userR.value.name,
    dingUserId: userR.value.dingUserId,
    dingUnionId: userR.value.dingUnionId
  }
  await CollegeService.updateUserSerivce(user)
  createElNotificationSuccess('用户更新成功')
  exposeR.value?.clearUser()
  userR.value = {}
}
</script>
<template>
  <el-row class="my-row" style="align-items: flex-end">
    <el-col :span="12">
      <DepartmentUser ref="exposeR" />
    </el-col>
    <template v-if="userR.id">
      <el-col>
        <el-button type="success" @click="resetPasswordF">重置账号密码为工号</el-button>
      </el-col>
      <el-col>
        <el-select
          value-key="id"
          v-model="departmentR"
          placeholder="部门"
          size="large"
          style="width: 200px; margin-right: 10px">
          <el-option
            v-for="(depart, index) of departmentsR"
            :key="index"
            :label="depart.name"
            :value="depart" />
        </el-select>
        <el-button type="success" :disabled="!departmentR" @click="updateDepartmentF">
          提交
        </el-button>
      </el-col>
      <!--  -->
      <el-col>
        <el-select
          v-model="roleR"
          placeholder="选择角色"
          size="large"
          style="width: 200px; margin-right: 10px">
          <el-option
            v-for="(role, index) of ROLES"
            :key="index"
            :label="role.name"
            :value="role.value" />
        </el-select>
        <el-button type="success" :disabled="!roleR" @click="updateUserRoleF">提交</el-button>
      </el-col>
      <el-col>
        <el-button type="danger" @click="removeUserF" style="margin-right: 10px">
          移除用户： {{ userR.name }} / {{ userR.account }}
        </el-button>
        <el-tag type="danger" size="large">
          移除用户将同时删除监考数据，建议学期开始或结束时移除。
        </el-tag>
      </el-col>
      <el-col>
        <el-form label-width="120px" style="width: 500px">
          <el-form-item label="姓名">
            <el-input v-model="userR.name" />
          </el-form-item>
          <el-form-item label="钉钉userid">
            <el-input v-model="userR.dingUserId" placeholder="钉钉userid" />
          </el-form-item>
          <el-form-item label="钉钉unionid">
            <el-input v-model="userR.dingUnionId" placeholder="钉钉unionid" />
          </el-form-item>
          <el-form-item>
            <el-button type="success" @click="updateUserInfoF">提交</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </template>
  </el-row>
</template>
