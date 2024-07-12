<script setup lang="ts">
import { CommonService } from '@/services/CommonService'
import HeaderView from './header/IndexView.vue'

await CommonService.getSettingsService()
</script>
<template>
  <HeaderView />
  <RouterView />
</template>
