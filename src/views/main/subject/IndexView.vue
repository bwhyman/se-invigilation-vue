<script setup lang="ts">
import { SubjectService } from '@/services/SubjectService'

await SubjectService.listSettingsService()
</script>
<template>
  <RouterView />
</template>
