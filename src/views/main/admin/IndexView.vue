<script setup lang="ts">
import AddCollegeView from './AddCollegeView.vue'
import ImportUsersView from './ImportUsersView.vue'
</script>
<template>
  <suspense>
    <template #default>
      <div>
        <AddCollegeView />
        <ImportUsersView />
      </div>
    </template>
    <template #fallback>
      <LoadingVue />
    </template>
  </suspense>
</template>
