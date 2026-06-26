ctspage · VUE
<template>
  <div class="page-products">
 
    <!-- ── Page header with background image ── -->
    <div class="page-hero">
      <div class="page-hero-bg" />
      <div class="page-hero-scrim" />
      <div class="page-hero-inner">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <span>Home</span>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="10" height="10"><path d="M6 4l4 4-4 4"/></svg>
          <span>Products</span>
          <template v-if="selectedCategoryName">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="10" height="10"><path d="M6 4l4 4-4 4"/></svg>
            <span class="breadcrumb-current">{{ selectedCategoryName }}</span>
          </template>
        </nav>
 
        <h1 class="page-h1">
          <template v-if="searchQuery">Results for <em>"{{ searchQuery }}"</em></template>
          <template v-else-if="selectedCategoryName">{{ selectedCategoryName }}</template>
          <template v-else>All Products</template>
        </h1>
 
        <p class="page-count">
          <span class="count-badge">{{ products.length }}</span> products found
        </p>
      </div>
    </div>
 
    <div class="container">
 
      <!-- ── Category chips ── -->
      <div class="category-strip">
        <button
          class="chip"
          :class="{ active: filters.category === '' }"
          @click="clearFilters"
        >All</button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="chip"
          :class="{ active: String(filters.category) === String(cat.id) }"
          @click="selectCategory(cat.id)"
        >{{ cat.name }}</button>
      </div>
 
      <!-- ── Main layout ── -->
      <div class="layout">
 
        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="sidebar-header">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15"><path d="M3 5h14M6 10h8M9 15h2"/></svg>
            Filters
          </div>
 
          <div class="filter-group">
            <label class="filter-label">Category</label>
            <div class="select-wrap">
              <select v-model="filters.category" @change="fetchProducts" class="styled-select">
                <option value="">All Categories</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
              <svg class="select-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" width="12" height="12"><path d="M4 6l4 4 4-4"/></svg>
            </div>
          </div>
 
          <div class="filter-group">
            <label class="filter-label">Price range</label>
            <div class="price-row">
              <div class="price-input-wrap">
                <span class="price-sign">$</span>
                <input
                  v-model="filters.min_price"
                  @change="fetchProducts"
                  type="number"
                  class="price-input"
                  placeholder="0"
                />
              </div>
              <div class="price-dash">—</div>
              <div class="price-input-wrap">
                <span class="price-sign">$</span>
                <input
                  v-model="filters.max_price"
                  @change="fetchProducts"
                  type="number"
                  class="price-input"
                  placeholder="9999"
                />
              </div>
            </div>
          </div>
 
          <button @click="clearFilters" class="btn-clear">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" width="13" height="13"><path d="M12 4L4 12M4 4l8 8"/></svg>
            Clear filters
          </button>
        </aside>
 
        <!-- Products area -->
        <main class="main-content">
 
          <!-- Loading skeletons -->
          <div v-if="loading" class="product-grid">
            <div v-for="n in 8" :key="n" class="skel" />
          </div>
 
          <!-- Empty -->
          <div v-else-if="products.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40">
                <circle cx="21" cy="21" r="14"/>
                <path d="M31 31l10 10"/>
                <path d="M17 21h8M21 17v8"/>
              </svg>
            </div>
            <h3>No products found</h3>
            <p>Try adjusting your filters or search term.</p>
            <button class="btn-clear" @click="clearFilters">Reset filters</button>
          </div>
 
          <!-- Grid -->
          <div v-else class="product-grid">
            <ProductCard
              v-for="product in validProducts"
              :key="product.id"
              :product="product"
              @added-to-cart="addToCart"
            />
          </div>
 
          <!-- Pagination -->
          <div v-if="pagination.last_page > 1" class="pagination">
            <button
              class="page-btn prev"
              :disabled="pagination.current_page === 1"
              @click="goToPage(pagination.current_page - 1)"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" width="14" height="14"><path d="M10 4L6 8l4 4"/></svg>
            </button>
 
            <template v-for="page in pagination.last_page" :key="page">
              <button
                class="page-btn"
                :class="{ active: page === pagination.current_page }"
                @click="goToPage(page)"
              >{{ page }}</button>
            </template>
 
            <button
              class="page-btn next"
              :disabled="pagination.current_page === pagination.last_page"
              @click="goToPage(pagination.current_page + 1)"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" width="14" height="14"><path d="M6 4l4 4-4 4"/></svg>
            </button>
          </div>
 
        </main>
      </div>
    </div>
 
    <!-- Toast notification -->
    <transition name="toast">
      <div v-if="toastMsg" class="toast" role="status">
        <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        {{ toastMsg }}
      </div>
    </transition>
 
  </div>
</template>
 
<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
 
import ProductCard from '@/components/ProductCard.vue'
import { productApi, categoryApi, cartApi } from '@/services/api'
import { useAuthStore, useCartStore } from '@/store'
 
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
 
const products = ref([])
const categories = ref([])
const loading = ref(true)
const searchQuery = ref('')
const toastMsg = ref('')
 
const pagination = reactive({ current_page: 1, last_page: 1 })
const filters = reactive({ category: '', min_price: '', max_price: '', page: 1 })
 
const selectedCategoryName = computed(() => {
  const cat = categories.value.find(c => String(c.id) === String(filters.category))
  return cat ? cat.name : ''
})
 
const validProducts = computed(() =>
  (Array.isArray(products.value) ? products.value : []).filter(p => p && p.id != null)
)
 
const showToast = (msg) => {
  toastMsg.value = msg
  setTimeout(() => { toastMsg.value = '' }, 2800)
}
 
const fetchProducts = async () => {
  loading.value = true
  try {
    let response
    if (searchQuery.value) {
      response = await productApi.search(searchQuery.value)
      products.value = response.data.data || response.data
    } else {
      const params = {}
      if (filters.category) params.category_id = filters.category
      if (filters.min_price) params.min_price = filters.min_price
      if (filters.max_price) params.max_price = filters.max_price
      params.page = filters.page
      response = await productApi.getAll(params)
      const data = response.data
      products.value = data.data || data
      if (data.last_page) {
        pagination.current_page = data.current_page
        pagination.last_page = data.last_page
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
 
const selectCategory = (id) => { filters.category = id; filters.page = 1; fetchProducts() }
const clearFilters = () => { filters.category = ''; filters.min_price = ''; filters.max_price = ''; filters.page = 1; fetchProducts() }
const goToPage = (page) => { filters.page = page; fetchProducts() }
 
const addToCart = async (product) => {
  if (!authStore.isAuthenticated) { router.push('/login'); return }
  try {
    await cartApi.add({ product_id: product.id, quantity: 1 })
    cartStore.addItem({ ...product, quantity: 1 })
    showToast('Added to cart!')
  } catch (error) {
    showToast(error.response?.data?.message || 'Could not add to cart')
  }
}
 
onMounted(async () => {
  try {
    const res = await categoryApi.getAll()
    categories.value = res.data.data || res.data
  } catch (e) { console.error(e) }
 
  searchQuery.value = route.query.q || ''
  if (route.query.category) filters.category = route.query.category
  fetchProducts()
})
 
watch(() => route.query.q, (q) => { searchQuery.value = q || ''; fetchProducts() })
</script>
 
<style scoped>
*, *::before, *::after { box-sizing: border-box; }
 
.page-products {
  background: #0A0A0F;
  color: #F0EDFF;
  min-height: 100vh;
  font-family: 'Inter', system-ui, sans-serif;
}
 
/* ── Page hero ─────────────────────────────────── */
.page-hero {
  position: relative;
  height: 260px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.page-hero-bg {
  position: absolute;
  inset: 0;
  background-image: url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&q=80');
  background-size: cover;
  background-position: center 40%;
}
.page-hero-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(10,10,15,0.5) 0%,
    rgba(10,10,15,0.92) 100%
  );
}
.page-hero-inner {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 40px 36px;
}
 
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8E8BA8;
  margin-bottom: 10px;
}
.breadcrumb-current { color: #C4B9FF; font-weight: 600; }
 
.page-h1 {
  margin: 0 0 10px;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.6px;
  color: #F0EDFF;
}
.page-h1 em {
  font-style: italic;
  background: linear-gradient(135deg, #7C6FFF, #C4B9FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
 
.page-count {
  margin: 0;
  font-size: 13px;
  color: #8E8BA8;
  display: flex;
  align-items: center;
  gap: 8px;
}
.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(124,111,255,0.15);
  border: 1px solid rgba(124,111,255,0.3);
  color: #C4B9FF;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 99px;
}
 
/* ── Container ──────────────────────────────────── */
.container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 40px 80px;
}
 
/* ── Category chips ─────────────────────────────── */
.category-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 28px 0 24px;
}
.chip {
  padding: 8px 18px;
  border-radius: 99px;
  border: 1px solid #2A2640;
  background: #1A1826;
  color: #8E8BA8;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.chip:hover { border-color: #7C6FFF; color: #C4B9FF; }
.chip.active {
  background: rgba(124,111,255,0.15);
  border-color: #7C6FFF;
  color: #C4B9FF;
  font-weight: 600;
}
 
/* ── Layout ─────────────────────────────────────── */
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
  align-items: start;
}
 
/* ── Sidebar ─────────────────────────────────────── */
.sidebar {
  background: #1A1826;
  border: 1px solid #2A2640;
  border-radius: 20px;
  padding: 24px;
  position: sticky;
  top: 24px;
}
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #F0EDFF;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #2A2640;
}
 
.filter-group { margin-bottom: 20px; }
.filter-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #8E8BA8;
  margin-bottom: 8px;
}
 
/* Select */
.select-wrap { position: relative; }
.styled-select {
  width: 100%;
  padding: 10px 34px 10px 12px;
  background: #12111C;
  border: 1px solid #2A2640;
  border-radius: 10px;
  color: #F0EDFF;
  font-size: 13px;
  font-family: inherit;
  appearance: none;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
}
.styled-select:focus { border-color: #7C6FFF; }
.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #5A576E;
  pointer-events: none;
}
 
/* Price inputs */
.price-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.price-input-wrap {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}
.price-sign {
  position: absolute;
  left: 10px;
  font-size: 12px;
  color: #5A576E;
  pointer-events: none;
}
.price-input {
  width: 100%;
  padding: 10px 8px 10px 24px;
  background: #12111C;
  border: 1px solid #2A2640;
  border-radius: 10px;
  color: #F0EDFF;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}
.price-input::placeholder { color: #5A576E; }
.price-input:focus { border-color: #7C6FFF; }
.price-dash { color: #5A576E; font-size: 14px; flex-shrink: 0; }
 
/* Clear button */
.btn-clear {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 11px 14px;
  background: rgba(255,92,114,0.08);
  border: 1px solid rgba(255,92,114,0.2);
  border-radius: 10px;
  color: #FF5C72;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
  margin-top: 4px;
  justify-content: center;
}
.btn-clear:hover { background: rgba(255,92,114,0.14); }
 
/* ── Product grid ────────────────────────────────── */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 18px;
}
 
/* Skeleton shimmer */
.skel {
  height: 340px;
  border-radius: 16px;
  background: linear-gradient(90deg, #1A1826 25%, #221F35 50%, #1A1826 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
 
/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 360px;
  gap: 12px;
  text-align: center;
  color: #8E8BA8;
}
.empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: #1A1826;
  border: 1px solid #2A2640;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5A576E;
  margin-bottom: 4px;
}
.empty-state h3 { margin: 0; font-size: 17px; color: #F0EDFF; }
.empty-state p { margin: 0; font-size: 13px; }
.empty-state .btn-clear { margin-top: 8px; }
 
/* ── Pagination ──────────────────────────────────── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #2A2640;
}
.page-btn {
  min-width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  border: 1px solid #2A2640;
  background: #1A1826;
  border-radius: 10px;
  color: #8E8BA8;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
}
.page-btn:hover:not(:disabled) { border-color: #7C6FFF; color: #C4B9FF; }
.page-btn.active {
  background: linear-gradient(135deg, #7C6FFF, #9D94FF);
  border-color: transparent;
  color: #fff;
  font-weight: 700;
}
.page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.page-btn.prev, .page-btn.next { color: #5A576E; }
 
/* ── Toast ───────────────────────────────────────── */
.toast {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 999;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 18px;
  background: rgba(26,24,38,0.95);
  border: 1px solid rgba(61,220,132,0.25);
  border-radius: 12px;
  color: #3DDC84;
  font-size: 13.5px;
  font-weight: 500;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }
 
/* ── Responsive ──────────────────────────────────── */
@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
  .sidebar { position: static; }
  .container { padding: 0 24px 60px; }
  .page-hero-inner { padding: 0 24px 28px; }
}
@media (max-width: 480px) {
  .page-hero { height: 220px; }
  .container { padding: 0 16px 48px; }
}
 
@media (prefers-reduced-motion: reduce) {
  .skel { animation: none; }
}
</style>