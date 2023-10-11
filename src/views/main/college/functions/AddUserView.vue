<script setup lang="ts">
import { addUserService, listDepartmentsService } from '@/services/CollegeService'
import { useUserStore } from '@/stores/UserStore'
import { ROLES } from '@/services/Const'
import type { Department, User } from '@/types'
import { useMessageStore } from '@/stores/MessageStore'
const departmentsR = ref<Department[]>([])
departmentsR.value = await listDepartmentsService()
const userR = ref<User>({})
const departR = ref<Department>()
const dialogFormVisible = ref(false)
const collUserR = useUserStore().userS
const openF = async () => {
  dialogFormVisible.value = true
  departmentsR.value = await listDepartmentsService()
}

const submit = async () => {
  userR.value.department = {
    collId: collUserR.department?.collId,
    collegeName: collUserR.department?.collegeName,
    depId: departR.value?.id,
    departmentName: departR.value?.name
  }

  addUserService(userR.value).then(() => {
    dialogFormVisible.value = false
    userR.value = {}
    storeToRefs(useMessageStore()).messageS.value = '添加成功'
  })
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <el-button type="success" style="margin-bottom: 10px" @click="openF">
        手动添加教师，需输入钉钉userid/unionid号
      </el-button>
    </el-col>
    <el-dialog v-model="dialogFormVisible" title="添加用户">
      <el-form>
        <el-form-item label="姓名">
          <el-input v-model="userR.name" />
        </el-form-item>
        <el-form-item label="工号">
          <el-input v-model="userR.account" />
        </el-form-item>
        <el-form-item label="钉钉userid">
          <el-input v-model="userR.dingUserId" />
        </el-form-item>
        <el-form-item label="钉钉unionid">
          <el-input v-model="userR.dingUnionId" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="userR.mobile" />
        </el-form-item>
        <el-form-item label="部门">
          <el-select
            value-key="id"
            v-model="departR"
            placeholder="选择新部门"
            size="large"
            style="width: 200px; margin-right: 10px">
            <el-option
              v-for="(depart, index) of departmentsR"
              :key="index"
              :label="depart.name"
              :value="depart" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="userR.role"
            placeholder="选择角色"
            size="large"
            style="width: 200px; margin-right: 10px">
            <el-option
              v-for="(role, index) of ROLES"
              :key="index"
              :label="role.name"
              :value="role.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">Cancel</el-button>
          <el-button type="primary" @click="submit">Confirm</el-button>
        </span>
      </template>
    </el-dialog>
  </el-row>
</template>
