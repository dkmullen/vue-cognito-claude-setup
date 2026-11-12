<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppNav from '@/components/AppNav.vue'
import { authState, signOut } from '@/stores/auth'

const drawer = ref(true)
const route = useRoute()
const router = useRouter()

// Login and sign-up pages are full-screen; everything else is the app shell.
const showChrome = computed(() => !route.meta.public)

async function onSignOut() {
  await signOut()
  router.replace({ name: 'login' })
}
</script>

<template>
  <v-app>
    <template v-if="showChrome">
      <v-app-bar color="primary" density="comfortable">
        <v-app-bar-nav-icon @click="drawer = !drawer" />
        <v-app-bar-title>Vue App</v-app-bar-title>
        <v-spacer />
        <span v-if="authState.user" class="text-body-2 mr-2 d-none d-sm-inline">
          {{ authState.user.email }}
        </span>
        <v-btn variant="text" @click="onSignOut">Sign out</v-btn>
      </v-app-bar>

      <v-navigation-drawer v-model="drawer">
        <AppNav />
      </v-navigation-drawer>
    </template>

    <v-main>
      <v-container fluid :class="showChrome ? 'pa-4' : 'pa-0'">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>
