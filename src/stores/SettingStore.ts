import { SETTING_FIRSTWEEK, SETTING_SHOWAVG } from '@/services/Const'
import type { Setting } from '@/types'

const settings = shallowRef<Setting[]>([])

const getFirstWeek = () => {
  return settings.value.find((set) => set.skey == SETTING_FIRSTWEEK)?.svalue ?? ''
}

const isShowavgC = computed(
  () =>
    settings.value.find((set) => set.skey == SETTING_SHOWAVG.name)?.svalue === SETTING_SHOWAVG.value
)

const getSetting = (key: string) => {
  return settings.value.find((set) => set.skey === key)
}

const store = { settings, getFirstWeek, isShowavgC, getSetting }
export const useSettingStore = () => store
