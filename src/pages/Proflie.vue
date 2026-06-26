<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/store'
import defaultAvatar from '@/assets/default-avatar.svg'
import '@/assets/css/Profile.css'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const saving = ref(false)
const errors = ref({})
const success = ref('')
const activeTab = ref('profile')
const avatarPreview = ref(null)
const avatarFile = ref(null)

const avatarUrl = computed(() => {
  if (avatarPreview.value) return avatarPreview.value
  if (authStore.user?.avatar_url) return authStore.user.avatar_url
  return defaultAvatar
})

const profileForm = reactive({
  name: '',
  email: '',
  phone: '',
  avatar: null,
})

const passwordForm = reactive({
  current_password: '',
  password: '',
  password_confirmation: '',
})

const fetchProfile = async () => {
  loading.value = true
  try {
    const response = await authApi.getProfile()
    const user = response.data.data
    profileForm.name = user.name
    profileForm.email = user.email
    profileForm.phone = user.phone || ''
    avatarPreview.value = user.avatar_url || null
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    avatarFile.value = file
    profileForm.avatar = file
    avatarPreview.value = URL.createObjectURL(file)
  }
}

const removeAvatar = () => {
  avatarFile.value = null
  profileForm.avatar = null
  avatarPreview.value = null
}

const updateProfile = async () => {
  errors.value = {}
  success.value = ''
  saving.value = true

  try {
    const response = await authApi.updateProfile(profileForm)
    authStore.setAuth(authStore.token, response.data.data)
    success.value = 'Profile updated successfully!'
    avatarFile.value = null
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    }
  } finally {
    saving.value = false
  }
}
const updatePassword = async () => {
  errors.value = {}
  success.value = ''
  saving.value = true
  try {
    await authApi.updatePassword(passwordForm)
    passwordForm.current_password = ''
    passwordForm.password = ''
    passwordForm.password_confirmation = ''
    success.value = 'Password updated successfully!'
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else if (error.response?.data?.message) {
      errors.value.general = [error.response.data.message]
    }
  } finally {
    saving.value = false
  }
}
 
const logout = () => {
  authStore.logout()
  router.push('/login')
}
 
onMounted(() => {
  fetchProfile()
})
</script>
 
<template>
  <div class="profile-page">
    <!-- Dot grid background -->
    <div class="bg-grid" aria-hidden="true" />
 
    <div class="container">
      <div v-if="loading" class="loading-state">
        <div class="spinner" />
        <span>Loading your profile…</span>
      </div>
 
      <div v-else class="profile-layout">
 
        <!-- ── Sidebar ── -->
        <aside class="sidebar">
          <div class="identity-card">
            <div class="avatar-wrap">
              <div class="avatar-ring" />
              <div class="avatar" :style="{ backgroundImage: `url(${avatarUrl})` }" />
            </div>
 
          <nav class="side-nav" aria-label="Profile sections">
            <button
              class="nav-btn"
              :class="{ active: activeTab === 'profile' }"
              @click="activeTab = 'profile'"
            >
              <svg class="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="10" cy="6.5" r="3.5"/>
                <path d="M2.5 17c0-3.314 3.358-6 7.5-6s7.5 2.686 7.5 6"/>
              </svg>
              Profile
            </button>
            <button
              class="nav-btn"
              :class="{ active: activeTab === 'password' }"
              @click="activeTab = 'password'"
            >
              <svg class="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="4" y="9" width="12" height="8" rx="2"/>
                <path d="M7 9V6.5a3 3 0 016 0V9"/>
              </svg>
              Password
            </button>
            <div class="nav-divider" />
            <button class="nav-btn danger" @click="logout">
              <svg class="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M13 3h3a1 1 0 011 1v12a1 1 0 01-1 1h-3M9 14l4-4-4-4M13 10H4"/>
              </svg>
              Sign out
            </button>
                    </nav>
        </div>
      </aside>
 
        <!-- ── Main content ── -->
        <main class="content">
 
          <!-- Toast -->
          <transition name="toast">
            <div v-if="success" class="toast success" role="status">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              {{ success }}
            </div>
          </transition>
 
          <!-- Profile tab -->
          <section v-if="activeTab === 'profile'" class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Profile information</h3>
                <p class="card-desc">Update your name, email address, and phone number.</p>
              </div>
            </div>
 
            <form @submit.prevent="updateProfile" novalidate>
              <div v-if="errors.general" class="inline-error">{{ errors.general[0] }}</div>
 
              <div class="fields">
                <div class="field">
                  <label class="field-label" for="f-name">Full name</label>
                  <div class="input-wrap" :class="{ 'has-error': errors.name }">
                    <svg class="input-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                      <circle cx="10" cy="6.5" r="3.5"/>
                      <path d="M2.5 17c0-3.314 3.358-6 7.5-6s7.5 2.686 7.5 6"/>
                    </svg>
                    <input
                      id="f-name"
                      v-model="profileForm.name"
                      type="text"
                      placeholder="Your full name"
                      autocomplete="name"
                    />
                  </div>
                  <span v-if="errors.name" class="field-error">{{ errors.name[0] }}</span>
                </div>
 
                <div class="field">
                  <label class="field-label" for="f-email">Email address</label>
                  <div class="input-wrap" :class="{ 'has-error': errors.email }">
                    <svg class="input-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="2" y="5" width="16" height="11" rx="2"/>
                      <path d="M2 7l8 5 8-5"/>
                    </svg>
                    <input
                      id="f-email"
                      v-model="profileForm.email"
                      type="email"
                      placeholder="you@example.com"
                      autocomplete="email"
                    />
                  </div>
                  <span v-if="errors.email" class="field-error">{{ errors.email[0] }}</span>
                </div>
 
                <div class="field">
                  <label class="field-label" for="f-phone">Phone <span class="optional">optional</span></label>
                  <div class="input-wrap" :class="{ 'has-error': errors.phone }">
                    <svg class="input-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M3 4a1 1 0 011-1h2.5a1 1 0 01.97.757l.7 2.8a1 1 0 01-.27.978L6.8 8.636A11.04 11.04 0 0011.364 13.2l1.101-1.101a1 1 0 01.978-.27l2.8.7A1 1 0 0117 13.5V16a1 1 0 01-1 1h-1C8.163 17 3 11.837 3 5V4z"/>
                    </svg>
                    <input
                      id="f-phone"
                      v-model="profileForm.phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      autocomplete="tel"
                    />
                  </div>
                  <span v-if="errors.phone" class="field-error">{{ errors.phone[0] }}</span>
                </div>
              </div>
 
              <div class="card-actions">
                <button type="submit" :disabled="saving" class="btn-primary">
                  <span v-if="saving" class="btn-spinner" />
                  {{ saving ? 'Saving…' : 'Save changes' }}
                </button>
              </div>
            </form>
          </section>
 
          <!-- Password tab -->
          <section v-if="activeTab === 'password'" class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Change password</h3>
                <p class="card-desc">Use a strong password you don't use anywhere else.</p>
              </div>
            </div>
 
            <form @submit.prevent="updatePassword" novalidate>
              <div v-if="errors.general" class="inline-error">{{ errors.general[0] }}</div>
 
              <div class="fields">
                <div class="field">
                  <label class="field-label" for="p-current">Current password</label>
                  <div class="input-wrap" :class="{ 'has-error': errors.current_password }">
                    <svg class="input-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="4" y="9" width="12" height="8" rx="2"/>
                      <path d="M7 9V6.5a3 3 0 016 0V9"/>
                    </svg>
                    <input
                      id="p-current"
                      v-model="passwordForm.current_password"
                      type="password"
                      placeholder="Enter current password"
                      autocomplete="current-password"
                    />
                  </div>
                  <span v-if="errors.current_password" class="field-error">{{ errors.current_password[0] }}</span>
                </div>
 
                <div class="field-row">
                  <div class="field">
                    <label class="field-label" for="p-new">New password</label>
                    <div class="input-wrap" :class="{ 'has-error': errors.password }">
                      <svg class="input-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M12 15v1M8 15v1M6 9V6.5a4 4 0 018 0V9"/>
                        <rect x="3" y="9" width="14" height="8" rx="2"/>
                      </svg>
                      <input
                        id="p-new"
                        v-model="passwordForm.password"
                        type="password"
                        placeholder="Min. 8 characters"
                        autocomplete="new-password"
                      />
                    </div>
                    <span v-if="errors.password" class="field-error">{{ errors.password[0] }}</span>
                  </div>
 
                  <div class="field">
                    <label class="field-label" for="p-confirm">Confirm new password</label>
                    <div class="input-wrap" :class="{ 'has-error': errors.password_confirmation }">
                      <svg class="input-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M9 12l2 2 4-4M7 2H5a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-6-6z"/>
                        <path d="M7 2v6h6"/>
                      </svg>
                      <input
                        id="p-confirm"
                        v-model="passwordForm.password_confirmation"
                        type="password"
                        placeholder="Repeat new password"
                        autocomplete="new-password"
                      />
                    </div>
                    <span v-if="errors.password_confirmation" class="field-error">{{ errors.password_confirmation[0] }}</span>
                  </div>
                </div>
              </div>
 
              <div class="card-actions">
                <button type="submit" :disabled="saving" class="btn-primary">
                  <span v-if="saving" class="btn-spinner" />
                  {{ saving ? 'Updating…' : 'Update password' }}
                </button>
              </div>
            </form>
          </section>
 
        </main>
      </div>
    </div>
  </div>
</template>
 
<style scoped>

</style>