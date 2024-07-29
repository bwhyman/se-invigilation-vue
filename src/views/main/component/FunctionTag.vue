<script setup lang="ts">
const props = defineProps<{ tagcoms: { name: string; component: Component }[] }>()
const components = props.tagcoms
const currentComponentR = ref()
const currentComponentC = computed(
  () => components.find((com) => com.name == currentComponentR.value)?.component
)
const typeC = computed(
  () => (name: string) => (name == currentComponentR.value ? 'danger' : 'primary')
)
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <el-check-tag
        checked
        v-for="(com, index) of components"
        :type="typeC(com.name)"
        :key="index"
        @click="currentComponentR = com.name"
        style="margin-right: 10px">
        {{ com.name }}
      </el-check-tag>
    </el-col>
  </el-row>
  <template v-if="currentComponentR">
    <component :is="currentComponentC" />
  </template>
</template>
