import { createApp } from 'vue'
import 'vuetify/styles'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { init, getIdToken, signOut } from '@/stores/auth'
import { setAuthTokenProvider, setUnauthorizedHandler } from '@/lib/http'

// Restore any existing session before the router's first navigation runs,
// so the auth guard sees the correct state.
await init()

setAuthTokenProvider(getIdToken)
setUnauthorizedHandler(async () => {
  await signOut().catch(() => {})
  router.replace({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
})

createApp(App).use(router).use(vuetify).mount('#app')
