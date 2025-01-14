<script setup lang="ts">
import { CollegeService } from '@/services/CollegeService'

await CollegeService.listSettingsService()
</script>
<template>
  <RouterView />
</template>
