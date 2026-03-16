import { createMessageDialog } from '@/components/message'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import queryClient from './vuequery'

const app = createApp(App)
app.use(router)
app.use(VueQueryPlugin, { queryClient })
app.mount('#app')

app.config.errorHandler = (err) => {
  const error = err as string
  console.error(error)
  createMessageDialog(error)
}
