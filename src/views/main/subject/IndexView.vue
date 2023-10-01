<script setup lang="ts">
import { listUsersService } from '@/services/SubjectService'
await listUsersService()
</script>
<template>
  <RouterView />
</template>
