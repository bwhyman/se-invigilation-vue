import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createMessageDialog } from '@/components/message'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

app.config.errorHandler = (err) => {
  const error = err as string
  console.error(error)
  createMessageDialog(error)
}
