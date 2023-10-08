<script setup lang="ts">
import { addCollegeService } from '@/services/AdminService'
import { useMessageStore } from '@/stores/MessageStore'

const collegeNameR = ref('')
const messageStore = useMessageStore()
const addCollegeF = async () => {
  await addCollegeService(collegeNameR.value)
  storeToRefs(messageStore).messageS.value = '添加成功'
  collegeNameR.value = ''
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <el-form :inline="true">
        <el-form-item>
          <el-input v-model="collegeNameR" placeholder="添加学院名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="success" :disabled="collegeNameR.length == 0" @click="addCollegeF">
            提交
          </el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>
