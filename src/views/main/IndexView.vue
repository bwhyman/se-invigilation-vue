<script setup lang="ts">
import { CommonService } from '@/services/CommonService'
import HeaderView from './header/IndexView.vue'

const { suspense } = CommonService.listSettingsService()
await suspense()
</script>
<template>
  <HeaderView />
  <RouterView />
</template>
