import type { Department } from '@/types'
import { defineStore } from 'pinia'

export const useDepartmentsStore = defineStore('useDepartmentsStore', () => {
  const departments = ref<Department[]>([])
  const departmentsOpened = ref<Department[]>([])

  return { departments, departmentsOpened }
})
