<script setup lang="ts">
import { getSettingsService } from '@/services/CommonService'
import HeaderView from './header/IndexView.vue'

await getSettingsService()
</script>
<template>
  <HeaderView />
  <RouterView />
</template>
