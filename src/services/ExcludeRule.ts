export const dayOfWeeksC = computed(() => (days: number[]) => {
  let daysCh = ''
  days.forEach((d) => {
    daysCh += dayOfWeeks.find((dw) => dw.value == d)?.name + '; '
  })
  return daysCh
})

export const periodOfDaysC = computed(() => (period: string[]) => {
  let periodsCh = ''
  period.forEach((d) => {
    periodsCh += periodOfDays.find((dw) => dw.value == d)?.name + '; '
  })
  return periodsCh
})

export const dayOfWeeks = [
  { name: '星期一', value: 1 },
  { name: '星期二', value: 2 },
  { name: '星期三', value: 3 },
  { name: '星期四', value: 4 },
  { name: '星期五', value: 5 },
  { name: '星期六', value: 6 },
  { name: '星期日', value: 7 }
]
export const periodOfDays = [
  { name: '12节', value: '12' },
  { name: '34节', value: '34' },
  { name: '56节', value: '56' },
  { name: '78节', value: '78' },
  { name: '910节', value: '910' },
  { name: '1112节', value: '1112' }
]
