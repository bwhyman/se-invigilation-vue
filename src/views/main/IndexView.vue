<script setup lang="ts">
import { getSettingsService } from '@/services/CommonService'
import HeaderView from './header/IndexView.vue'
import LoadingVue from '@/components/LoadingVue.vue'

getSettingsService()
</script>
<template>
  <HeaderView />
  <suspense>
    <template #default>
      <RouterView />
    </template>
    <template #fallback>
      <LoadingVue />
    </template>
  </suspense>
</template>
