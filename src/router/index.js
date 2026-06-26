import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store'

const routes = [
  { path: '/', name: 'Home', component: () => import('@/pages/Home.vue') },
  { path: '/products', name: 'Products', component: () => import('@/pages/Products.vue') },
  { path: '/products/:id', name: 'ProductDetail', component: () => import('@/pages/ProductDetail.vue'), props: true },
  { path: '/login', name: 'Login', component: () => import('@/pages/Login.vue'), meta: { guest: true } },
  { path: '/register', name: 'Register', component: () => import('@/pages/Register.vue'), meta: { guest: true } },
  { path: '/wishlist', name: 'Wishlist', component: () => import('@/pages/Wishlist.vue'), meta: { requiresAuth: true } },
  { path: '/cart', name: 'Cart', component: () => import('@/pages/Cart.vue'), meta: { requiresAuth: true } },
  { path: '/checkout', name: 'Checkout', component: () => import('@/pages/Checkout.vue'), meta: { requiresAuth: true } },
  { path: '/orders', name: 'Orders', component: () => import('@/pages/Orders.vue'), meta: { requiresAuth: true } },
  { path: '/orders/:id', name: 'OrderDetail', component: () => import('@/pages/OrderDetail.vue'), meta: { requiresAuth: true }, props: true },
  { path: '/profile', name: 'Profile', component: () => import('@/pages/Proflie.vue'), meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } }
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guest && authStore.isAuthenticated) {
    return { name: 'Home' }
  }

  if (to.meta.requiresAuth && authStore.isAuthenticated && !authStore.user.value) {
    try {
      const { authApi } = await import('@/services/api')
      const response = await authApi.getProfile()
      authStore.setAuth(authStore.token, response.data)
    } catch {
      authStore.logout()
      return { name: 'Login' }
    }
  }
})

export default router