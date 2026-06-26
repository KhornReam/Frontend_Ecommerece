<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/store'
import '@/assets/css/Login.css'
 
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
 
// State
const loading = ref(false)
const loginAttempts = ref(0)
const maxAttempts = 5
const showPassword = ref(false)
const loginSuccess = ref(false)
const redirectProgress = ref(0)
const touched = ref({ email: false, password: false })
 
const form = ref({
  email: '',
  password: '',
})
 
const alert = ref({
  show: false,
  type: '',   // 'error' | 'warning' | 'success'
  message: '',
})
 
// Validation
const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email))
const passwordValid = computed(() => form.value.password.length >= 6)
 
const emailState = computed(() => {
  if (!touched.value.email || !form.value.email) return ''
  return emailValid.value ? 'success' : 'error'
})
 
const passwordState = computed(() => {
  if (!touched.value.password || !form.value.password) return ''
  return passwordValid.value ? 'success' : 'error'
})
 
const isLocked = computed(() => loginAttempts.value >= maxAttempts)
 
const remainingAttempts = computed(() => maxAttempts - loginAttempts.value)
 
// Alert helpers
function showAlert(type, message) {
  alert.value = { show: true, type, message }
}
 
function hideAlert() {
  alert.value.show = false
}
 
// Redirect progress bar after success
function startRedirectProgress() {
  redirectProgress.value = 0
  const interval = setInterval(() => {
    redirectProgress.value += 2
    if (redirectProgress.value >= 100) {
      clearInterval(interval)
    }
  }, 60)
}
 
// Login handler
const login = async () => {
  touched.value = { email: true, password: true }
  hideAlert()
 
  if (isLocked.value) {
    showAlert('error', 'Account temporarily locked due to too many attempts. Reset your password or try again later.')
    return
  }
 
  if (!form.value.email) {
    showAlert('error', 'Email address is required.')
    return
  }
 
  if (!emailValid.value) {
    showAlert('error', 'Please enter a valid email address.')
    return
  }
 
  if (!form.value.password) {
    showAlert('error', 'Password is required.')
    return
  }
 
  if (!passwordValid.value) {
    showAlert('error', 'Password must be at least 6 characters long.')
    return
  }
 
  loading.value = true
 
  try {
    const response = await authApi.login(form.value)
 
    authStore.setAuth(response.data.token, response.data.user)
 
    loginSuccess.value = true
    showAlert('success', `Welcome back, ${response.data.user?.name || 'there'}! Redirecting you now…`)
    startRedirectProgress()
 
    setTimeout(() => {
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    }, 3000)
 
  } catch (error) {
    loginAttempts.value++
 
    const status = error.response?.status
    const serverErrors = error.response?.data?.errors
    const serverMessage = error.response?.data?.message
 
    if (status === 401) {
      if (remainingAttempts.value <= 2) {
        showAlert('warning', `Incorrect credentials. ${remainingAttempts.value} attempt(s) remaining before your account is locked.`)
      } else {
        showAlert('error', 'Incorrect email or password. Please try again.')
      }
    } else if (status === 403) {
      showAlert('warning', 'Your account has been suspended. Contact support for help.')
    } else if (status === 422 && serverErrors) {
      const firstKey = Object.keys(serverErrors)[0]
      showAlert('error', serverErrors[firstKey][0])
    } else if (status === 429) {
      showAlert('warning', 'Too many requests. Please wait a moment before trying again.')
    } else if (status >= 500) {
      showAlert('error', 'Server error. Our team has been notified — please try again in a moment.')
    } else if (serverMessage) {
      showAlert('error', serverMessage)
    } else if (!navigator.onLine) {
      showAlert('error', 'No internet connection. Check your network and try again.')
    } else {
      showAlert('error', 'Something went wrong. Please try again.')
    }
  } finally {
    loading.value = false
  }
}
 
const handleForgotPassword = () => {
  router.push('/forgot-password')
}
</script>
 
<template>
  <div class="page">
    <div class="card">
 
      <!-- Logo -->
      <div class="logo-wrap">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
 
      <!-- Header -->
      <div class="header">
        <h1>Welcome back</h1>
        <p>Sign in to continue to your account</p>
      </div>
 
      <!-- Alert -->
      <transition name="fade-slide">
        <div
          v-if="alert.show"
          :class="['alert', `alert--${alert.type}`]"
          role="alert"
        >
          <span class="alert__icon">
            <svg v-if="alert.type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <svg v-else-if="alert.type === 'warning'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </span>
          <span class="alert__message">{{ alert.message }}</span>
          <button class="alert__close" @click="hideAlert" aria-label="Dismiss">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </transition>
 
      <!-- Success redirect progress -->
      <div v-if="loginSuccess" class="redirect-bar">
        <div class="redirect-bar__fill" :style="{ width: redirectProgress + '%' }"></div>
      </div>
 
      <!-- Form -->
      <form @submit.prevent="login" novalidate>
 
        <!-- Email -->
        <div :class="['field', emailState && `field--${emailState}`]">
          <label for="email">Email</label>
          <div class="input-wrap">
            <span class="input-icon input-icon--left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </span>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
              :disabled="loading || loginSuccess"
              @blur="touched.email = true"
            />
            <span v-if="emailState" class="input-icon input-icon--right">
              <svg v-if="emailState === 'success'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </span>
          </div>
          <p v-if="touched.email && !emailValid && form.email" class="field-hint field-hint--error">
            Enter a valid email address (e.g. you@example.com)
          </p>
        </div>
 
        <!-- Password -->
        <div :class="['field', passwordState && `field--${passwordState}`]">
          <div class="label-row">
            <label for="password">Password</label>
            <button type="button" class="link-btn" @click="handleForgotPassword">Forgot password?</button>
          </div>
          <div class="input-wrap">
            <span class="input-icon input-icon--left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              autocomplete="current-password"
              :disabled="loading || loginSuccess"
              @blur="touched.password = true"
            />
            <button
              type="button"
              class="input-icon input-icon--right input-icon--btn"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              <svg v-if="!showPassword" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </button>
          </div>
          <p v-if="touched.password && !passwordValid && form.password" class="field-hint field-hint--error">
            Password must be at least 6 characters
          </p>
        </div>
 
        <!-- Lockout warning -->
        <div v-if="loginAttempts > 0 && !isLocked" class="attempts-notice">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
          {{ remainingAttempts }} attempt{{ remainingAttempts !== 1 ? 's' : '' }} remaining before lockout
        </div>
 
        <!-- Submit -->
        <button
          type="submit"
          class="btn-primary"
          :disabled="loading || loginSuccess || isLocked"
        >
          <span v-if="loading" class="spinner" aria-hidden="true"></span>
          <svg v-else-if="loginSuccess" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span>{{ loading ? 'Signing in…' : loginSuccess ? 'Signed in' : isLocked ? 'Account locked' : 'Sign in' }}</span>
        </button>
 
      </form>
 
      <!-- Divider -->
      <div class="divider"><span>or</span></div>
 
      <!-- Social -->
      <div class="social-row">
        <button type="button" class="btn-social">
          <svg width="17" height="17" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>
        <button type="button" class="btn-social">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          Continue with GitHub
        </button>
      </div>
 
      <!-- Footer -->
      <p class="footer">
        Don't have an account?
        <RouterLink to="/register" class="link">Create one</RouterLink>
      </p>
 
    </div>
  </div>
</template>
 
