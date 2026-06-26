<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, useCartStore, useWishlistStore } from '@/store'
 
const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
 
const isLoggedIn   = computed(() => authStore.isAuthenticated)
const cartCount    = computed(() => cartStore.totalItems)
const wishlistCount = computed(() => wishlistStore.totalItems)
const userName     = computed(() => authStore.user?.name || '')
const userInitial  = computed(() => userName.value.charAt(0).toUpperCase() || 'U')
 
const showDropdown = ref(false)
const mobileOpen   = ref(false)
const scrolled     = ref(false)
const dropdownRef  = ref(null)
 
// Scroll shadow
function onScroll() {
  scrolled.value = window.scrollY > 8
}
 
// Close dropdown on outside click
function onClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    showDropdown.value = false
  }
}
 
onMounted(() => {
  window.addEventListener('scroll', onScroll)
  document.addEventListener('mousedown', onClickOutside)
})
 
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('mousedown', onClickOutside)
})
 
function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}
 
function closeMobile() {
  mobileOpen.value = false
}
 
function logout() {
  showDropdown.value = false
  authStore.logout()
  router.push('/')
}
</script>
 
<template>
  <header :class="['navbar', scrolled && 'navbar--scrolled']">
    <div class="nav-container">
 
      <!-- Logo -->
      <router-link to="/" class="logo" @click="closeMobile">
        <div class="logo-mark">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        </div>
        <span class="logo-text">ShopVue</span>
      </router-link>
 
      <!-- Desktop nav links -->
      <nav class="nav-links" aria-label="Main navigation">
        <router-link to="/">Home</router-link>
        <router-link to="/products">Products</router-link>
      </nav>
 
      <!-- Right actions -->
      <div class="nav-actions">
 
        <!-- Wishlist -->
        <router-link to="/wishlist" class="icon-btn" aria-label="Wishlist">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span v-if="wishlistCount > 0" class="badge">{{ wishlistCount > 9 ? '9+' : wishlistCount }}</span>
        </router-link>
 
        <!-- Cart -->
        <router-link to="/cart" class="icon-btn" aria-label="Cart">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <span v-if="cartCount > 0" class="badge">{{ cartCount > 9 ? '9+' : cartCount }}</span>
        </router-link>
 
        <!-- Logged in: user dropdown -->
        <div v-if="isLoggedIn" class="user-menu" ref="dropdownRef">
          <button
            class="avatar-btn"
            @click="toggleDropdown"
            :aria-expanded="showDropdown"
            aria-haspopup="true"
            :aria-label="`Account menu for ${userName}`"
          >
            <span class="avatar-initial">{{ userInitial }}</span>
            <svg class="avatar-chevron" :class="showDropdown && 'rotated'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
 
          <transition name="dropdown">
            <div v-if="showDropdown" class="dropdown" role="menu">
              <!-- User info -->
              <div class="dropdown-header">
                <div class="dropdown-avatar">{{ userInitial }}</div>
                <div class="dropdown-info">
                  <p class="dropdown-name">{{ userName }}</p>
                  <p class="dropdown-email">{{ authStore.user?.email }}</p>
                </div>
              </div>
 
              <div class="dropdown-divider"></div>
 
              <router-link to="/profile" class="dropdown-item" role="menuitem" @click="showDropdown = false">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                My profile
              </router-link>
 
              <router-link to="/orders" class="dropdown-item" role="menuitem" @click="showDropdown = false">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                My orders
              </router-link>
 
              <router-link to="/wishlist" class="dropdown-item" role="menuitem" @click="showDropdown = false">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                Wishlist
                <span v-if="wishlistCount > 0" class="dropdown-count">{{ wishlistCount }}</span>
              </router-link>
 
              <div class="dropdown-divider"></div>
 
              <button class="dropdown-item dropdown-item--danger" role="menuitem" @click="logout">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign out
              </button>
            </div>
          </transition>
        </div>
 
        <!-- Logged out: auth buttons -->
        <div v-else class="auth-buttons">
          <router-link to="/login" class="btn-ghost">Sign in</router-link>
          <router-link to="/register" class="btn-solid">Get started</router-link>
        </div>
 
        <!-- Mobile hamburger -->
        <button
          class="hamburger"
          @click="mobileOpen = !mobileOpen"
          :aria-expanded="mobileOpen"
          aria-label="Toggle mobile menu"
        >
          <span :class="['bar', mobileOpen && 'bar--open']"></span>
          <span :class="['bar', mobileOpen && 'bar--open']"></span>
          <span :class="['bar', mobileOpen && 'bar--open']"></span>
        </button>
      </div>
    </div>
 
    <!-- Mobile menu -->
    <transition name="mobile">
      <div v-if="mobileOpen" class="mobile-menu">
        <nav class="mobile-nav">
          <router-link to="/" @click="closeMobile">Home</router-link>
          <router-link to="/products" @click="closeMobile">Products</router-link>
          <router-link to="/wishlist" @click="closeMobile">
            Wishlist
            <span v-if="wishlistCount > 0" class="mobile-badge">{{ wishlistCount }}</span>
          </router-link>
          <router-link to="/cart" @click="closeMobile">
            Cart
            <span v-if="cartCount > 0" class="mobile-badge">{{ cartCount }}</span>
          </router-link>
        </nav>
 
        <div class="mobile-divider"></div>
 
        <div v-if="isLoggedIn" class="mobile-user">
          <div class="mobile-user-info">
            <div class="avatar-btn" style="cursor:default; pointer-events:none;">
              <span class="avatar-initial">{{ userInitial }}</span>
            </div>
            <div>
              <p class="mobile-name">{{ userName }}</p>
              <p class="mobile-email">{{ authStore.user?.email }}</p>
            </div>
          </div>
          <router-link to="/profile" class="mobile-link" @click="closeMobile">My profile</router-link>
          <router-link to="/orders"  class="mobile-link" @click="closeMobile">My orders</router-link>
          <button class="mobile-logout" @click="logout">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign out
          </button>
        </div>
 
        <div v-else class="mobile-auth">
          <router-link to="/login"    class="btn-ghost w-full" @click="closeMobile">Sign in</router-link>
          <router-link to="/register" class="btn-solid w-full" @click="closeMobile">Get started</router-link>
        </div>
      </div>
    </transition>
  </header>
</template>
 
<style scoped>
/* ── Navbar shell ── */
.navbar {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: box-shadow 0.2s;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
 
.navbar--scrolled {
  box-shadow: 0 1px 12px rgba(0, 0, 0, 0.07);
}
 
/* ── Container ── */
.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
 
/* ── Logo ── */
.logo {
  display: flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
  flex-shrink: 0;
}
 
.logo-mark {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: #111827;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}
 
.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  letter-spacing: -0.3px;
}
 
/* ── Desktop nav links ── */
.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  padding-left: 8px;
}
 
.nav-links a {
  text-decoration: none;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background 0.15s, color 0.15s;
}
 
.nav-links a:hover {
  background: #f3f4f6;
  color: #111827;
}
 
.nav-links a.router-link-exact-active {
  color: #111827;
  background: #f3f4f6;
}
 
/* ── Right actions ── */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
 
/* ── Icon buttons (cart, wishlist) ── */
.icon-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}
 
.icon-btn:hover {
  background: #f3f4f6;
  color: #111827;
}
 
/* ── Badge ── */
.badge {
  position: absolute;
  top: -3px;
  right: -3px;
  min-width: 16px;
  height: 16px;
  background: #ef4444;
  color: #ffffff;
  font-size: 9px;
  font-weight: 700;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  border: 1.5px solid #ffffff;
}
 
/* ── Avatar button ── */
.user-menu { position: relative; }
 
.avatar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 4px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
 
.avatar-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}
 
.avatar-initial {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: #111827;
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
 
.avatar-chevron {
  color: #9ca3af;
  transition: transform 0.2s;
}
 
.avatar-chevron.rotated { transform: rotate(180deg); }
 
/* ── Dropdown ── */
.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.09);
  padding: 6px;
  z-index: 200;
}
 
.dropdown-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px 10px;
}
 
.dropdown-avatar {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: #111827;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
 
.dropdown-info { min-width: 0; }
 
.dropdown-name {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
 
.dropdown-email {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
 
.dropdown-divider {
  height: 1px;
  background: #f3f4f6;
  margin: 4px 0;
}
 
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 9px 10px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  text-decoration: none;
  border: none;
  background: none;
  cursor: pointer;
  transition: background 0.12s;
  text-align: left;
}
 
.dropdown-item:hover { background: #f3f4f6; }
 
.dropdown-item--danger { color: #dc2626; }
.dropdown-item--danger:hover { background: #fef2f2; }
 
.dropdown-count {
  margin-left: auto;
  min-width: 18px;
  height: 18px;
  background: #f3f4f6;
  color: #374151;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}
 
/* ── Auth buttons ── */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}
 
.btn-ghost {
  padding: 7px 14px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  text-decoration: none;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  transition: background 0.15s, border-color 0.15s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
 
.btn-ghost:hover { background: #f9fafb; border-color: #d1d5db; }
 
.btn-solid {
  padding: 7px 14px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
  text-decoration: none;
  background: #111827;
  border: 1px solid transparent;
  transition: background 0.15s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
 
.btn-solid:hover { background: #1f2937; }
 
.w-full { width: 100%; }
 
/* ── Hamburger ── */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  background: #ffffff;
  cursor: pointer;
  padding: 0 9px;
}
 
.bar {
  display: block;
  width: 100%;
  height: 1.5px;
  background: #374151;
  border-radius: 1px;
  transition: transform 0.2s, opacity 0.2s;
}
 
/* ── Mobile menu ── */
.mobile-menu {
  border-top: 1px solid #f3f4f6;
  padding: 12px 16px 16px;
  background: #ffffff;
}
 
.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
 
.mobile-nav a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 10px;
  text-decoration: none;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.15s;
}
 
.mobile-nav a:hover,
.mobile-nav a.router-link-exact-active {
  background: #f3f4f6;
  color: #111827;
}
 
.mobile-badge {
  min-width: 20px;
  height: 20px;
  background: #ef4444;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}
 
.mobile-divider {
  height: 1px;
  background: #f3f4f6;
  margin: 10px 0;
}
 
.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px 12px;
}
 
.mobile-name  { margin: 0; font-size: 14px; font-weight: 600; color: #111827; }
.mobile-email { margin: 0; font-size: 12px; color: #9ca3af; }
 
.mobile-link {
  display: block;
  padding: 10px 12px;
  border-radius: 10px;
  text-decoration: none;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.15s;
}
 
.mobile-link:hover { background: #f3f4f6; }
 
.mobile-logout {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  margin-top: 4px;
  border: none;
  border-radius: 10px;
  background: none;
  color: #dc2626;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  text-align: left;
}
 
.mobile-logout:hover { background: #fef2f2; }
 
.mobile-auth {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 4px;
}
 
/* ── Dropdown transition ── */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
 
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
 
/* ── Mobile menu transition ── */
.mobile-enter-active,
.mobile-leave-active {
  transition: opacity 0.2s ease, max-height 0.2s ease;
  overflow: hidden;
  max-height: 500px;
}
 
.mobile-enter-from,
.mobile-leave-to {
  opacity: 0;
  max-height: 0;
}
 
/* ── Responsive ── */
@media (max-width: 768px) {
  .nav-links   { display: none; }
  .auth-buttons { display: none; }
  .hamburger   { display: flex; }
}
 
@media (min-width: 769px) {
  .mobile-menu { display: none; }
}
 
/* ── Dark mode ── */
@media (prefers-color-scheme: dark) {
  .navbar { background: #1e293b; border-bottom-color: #334155; }
  .navbar--scrolled { box-shadow: 0 1px 12px rgba(0,0,0,0.3); }
 
  .logo-text { color: #f1f5f9; }
  .logo-mark { background: #f1f5f9; color: #0f172a; }
 
  .nav-links a { color: #94a3b8; }
  .nav-links a:hover,
  .nav-links a.router-link-exact-active { background: #0f172a; color: #f1f5f9; }
 
  .icon-btn { color: #94a3b8; }
  .icon-btn:hover { background: #0f172a; color: #f1f5f9; }
 
  .badge { border-color: #1e293b; }
 
  .avatar-btn { background: #1e293b; border-color: #334155; }
  .avatar-btn:hover { background: #0f172a; border-color: #475569; }
  .avatar-initial { background: #f1f5f9; color: #0f172a; }
  .avatar-chevron { color: #64748b; }
 
  .dropdown { background: #1e293b; border-color: #334155; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
  .dropdown-avatar { background: #f1f5f9; color: #0f172a; }
  .dropdown-name { color: #f1f5f9; }
  .dropdown-divider { background: #334155; }
  .dropdown-item { color: #cbd5e1; }
  .dropdown-item:hover { background: #0f172a; }
  .dropdown-item--danger { color: #f87171; }
  .dropdown-item--danger:hover { background: #450a0a; }
  .dropdown-count { background: #0f172a; color: #94a3b8; }
 
  .btn-ghost { color: #cbd5e1; border-color: #334155; background: #1e293b; }
  .btn-ghost:hover { background: #0f172a; border-color: #475569; }
  .btn-solid { background: #f1f5f9; color: #0f172a; }
  .btn-solid:hover { background: #e2e8f0; }
 
  .hamburger { background: #1e293b; border-color: #334155; }
  .bar { background: #94a3b8; }
 
  .mobile-menu { background: #1e293b; border-top-color: #334155; }
  .mobile-nav a { color: #cbd5e1; }
  .mobile-nav a:hover,
  .mobile-nav a.router-link-exact-active { background: #0f172a; color: #f1f5f9; }
  .mobile-divider { background: #334155; }
  .mobile-name { color: #f1f5f9; }
  .mobile-link { color: #cbd5e1; }
  .mobile-link:hover { background: #0f172a; }
  .mobile-logout { color: #f87171; }
  .mobile-logout:hover { background: #450a0a; }
}
</style>