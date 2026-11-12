import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { isAuthenticated } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      // Public routes (meta.public) are reachable signed out; every other
      // route requires a signed-in user. See beforeEach below.
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/SignUpView.vue'),
      meta: { public: true },
    },
    {
      path: '/sample-one',
      name: 'sample-one',
      // Lazy-loaded: the page's code is fetched only when visited.
      component: () => import('@/views/SampleOneView.vue'),
    },
    {
      path: '/sample-two',
      name: 'sample-two',
      component: () => import('@/views/SampleTwoView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  const authed = isAuthenticated.value

  if (!to.meta.public && !authed) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.public && authed) {
    return { path: '/' }
  }
})

export default router
