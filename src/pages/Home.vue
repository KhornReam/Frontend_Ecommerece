<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { productApi } from '@/services/api'
import ProductCard from '@/components/ProductCard.vue'
import '@/assets/css/home.css'
 
const featuredProducts = ref([])
const loading = ref(true)
const email = ref('')
 
const fetchFeaturedProducts = async () => {
  try {
    const response = await productApi.getAll({ limit: 8 })
    featuredProducts.value = response.data.data.data || response.data.data || []
  } catch (error) {
    console.error('Failed to load products', error)
  } finally {
    loading.value = false
  }
}
 
onMounted(() => {
  fetchFeaturedProducts()
})
</script>
 
<template>
  <div class="home">
 
    <!-- ══════════════════════════════════════════
         HERO — full-bleed image + mosaic float
    ══════════════════════════════════════════ -->
    <section class="hero">
      <!-- Background image layer -->
      <div class="hero-bg" />
      <!-- Dark scrim -->
      <div class="hero-scrim" />
 
      <div class="hero-inner">
        <!-- Left: copy -->
        <div class="hero-copy">
          <span class="eyebrow">✦ New Collection 2026</span>
          <h1 class="hero-h1">
            Style that <em>moves</em><br>with you
          </h1>
          <p class="hero-sub">
            Premium products curated for modern living —
            shipped in 24 hours, loved for years.
          </p>
          <div class="hero-actions">
            <RouterLink to="/products" class="cta-primary">Shop now</RouterLink>
            <RouterLink to="/products" class="cta-ghost">Explore all</RouterLink>
          </div>
          <!-- Inline stats -->
          <div class="hero-stats">
            <div class="hstat">
              <strong>10K+</strong><span>Products</span>
            </div>
            <div class="hstat-divider" />
            <div class="hstat">
              <strong>25K+</strong><span>Happy customers</span>
            </div>
            <div class="hstat-divider" />
            <div class="hstat">
              <strong>4.9★</strong><span>Avg. rating</span>
            </div>
          </div>
        </div>
 
        <!-- Right: floating image mosaic -->
        <div class="hero-mosaic" aria-hidden="true">
          <div class="mosaic-col mosaic-col-1">
            <img
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=340&q=80"
              alt=""
              class="mosaic-img"
            />
            <img
              src="https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=340&q=80"
              alt=""
              class="mosaic-img tall"
            />
          </div>
          <div class="mosaic-col mosaic-col-2">
            <img
              src="https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=340&q=80"
              alt=""
              class="mosaic-img tall"
            />
            <img
              src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=340&q=80"
              alt=""
              class="mosaic-img"
            />
          </div>
        </div>
      </div>
 
      <!-- Scroll hint -->
      <div class="scroll-hint" aria-hidden="true">
        <span>Scroll</span>
        <div class="scroll-line" />
      </div>
    </section>
 
    <!-- ══════════════════════════════════════════
         CATEGORIES — image-backed cards
    ══════════════════════════════════════════ -->
    <section class="section categories-section">
      <div class="section-head">
        <p class="label">Browse by category</p>
        <h2 class="section-h2">What are you looking for?</h2>
      </div>
 
      <div class="cat-grid">
        <RouterLink to="/products?category=electronics" class="cat-card" style="--img: url('https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&q=75')">
          <div class="cat-scrim" />
          <div class="cat-body">
            <span class="cat-icon">📱</span>
            <h3>Electronics</h3>
            <span class="cat-count">2,400+ items</span>
          </div>
        </RouterLink>
 
        <RouterLink to="/products?category=fashion" class="cat-card" style="--img: url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=75')">
          <div class="cat-scrim" />
          <div class="cat-body">
            <span class="cat-icon">👕</span>
            <h3>Fashion</h3>
            <span class="cat-count">3,800+ items</span>
          </div>
        </RouterLink>
 
        <RouterLink to="/products?category=computers" class="cat-card" style="--img: url('https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=75')">
          <div class="cat-scrim" />
          <div class="cat-body">
            <span class="cat-icon">💻</span>
            <h3>Computers</h3>
            <span class="cat-count">1,200+ items</span>
          </div>
        </RouterLink>
 
        <RouterLink to="/products?category=accessories" class="cat-card" style="--img: url('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=75')">
          <div class="cat-scrim" />
          <div class="cat-body">
            <span class="cat-icon">⌚</span>
            <h3>Accessories</h3>
            <span class="cat-count">980+ items</span>
          </div>
        </RouterLink>
      </div>
    </section>
 
    <!-- ══════════════════════════════════════════
         FEATURED PRODUCTS
    ══════════════════════════════════════════ -->
    <section class="section products-section">
      <div class="section-head row">
        <div>
          <p class="label">Hand-picked for you</p>
          <h2 class="section-h2">Featured products</h2>
        </div>
        <RouterLink to="/products" class="view-all-link">
          View all
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" width="14" height="14"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
        </RouterLink>
      </div>
 
      <div v-if="loading" class="product-grid">
        <div v-for="n in 8" :key="n" class="skel" />
      </div>
      <div v-else class="product-grid">
        <ProductCard
          v-for="product in featuredProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </section>
 
    <!-- ══════════════════════════════════════════
         PROMO — full-width image banner
    ══════════════════════════════════════════ -->
    <section class="promo-section">
      <div class="promo-bg" />
      <div class="promo-scrim" />
      <div class="promo-body">
        <span class="promo-eyebrow">Limited time</span>
        <h2 class="promo-h2">Summer Sale —<br>up to 50% off</h2>
        <p class="promo-sub">Selected items only. Ends July 31st.</p>
        <RouterLink to="/products?sale=true" class="cta-primary">Shop deals</RouterLink>
      </div>
    </section>
 
    <!-- ══════════════════════════════════════════
         TRUST FEATURES
    ══════════════════════════════════════════ -->
    <section class="section trust-section">
      <div class="trust-grid">
        <div class="trust-card">
          <div class="trust-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28"><path d="M5 12h14M12 5l7 7-7 7"/><path d="M3 6c0-1.1.9-2 2-2h4l2 3H5a2 2 0 01-2-2z" stroke="none" fill="currentColor" opacity=".15"/><rect x="1" y="10" width="20" height="10" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>
          </div>
          <h3>Free shipping</h3>
          <p>On all orders over $50 — no code needed.</p>
        </div>
        <div class="trust-card">
          <div class="trust-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28"><path d="M4 4v5h5M20 20v-5h-5"/><path d="M20.49 9A9 9 0 005.64 5.64L4 9M3.51 15A9 9 0 0018.36 18.36L20 15"/></svg>
          </div>
          <h3>Easy returns</h3>
          <p>Changed your mind? 30 days, no questions asked.</p>
        </div>
        <div class="trust-card">
          <div class="trust-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h3>Secure checkout</h3>
          <p>256-bit SSL encryption on every transaction.</p>
        </div>
        <div class="trust-card">
          <div class="trust-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          </div>
          <h3>24/7 support</h3>
          <p>Real humans, always on. Average reply: 4 min.</p>
        </div>
      </div>
    </section>
 
    <!-- ══════════════════════════════════════════
         NEWSLETTER — image background
    ══════════════════════════════════════════ -->
    <section class="newsletter-section">
      <div class="nl-bg" />
      <div class="nl-scrim" />
      <div class="nl-body">
        <p class="label light">Stay in the loop</p>
        <h2 class="nl-h2">Get early access to drops<br>and exclusive deals</h2>
        <p class="nl-sub">Join 25,000+ subscribers. No spam, ever.</p>
        <div class="nl-form">
          <input
            v-model="email"
            type="email"
            placeholder="your@email.com"
            class="nl-input"
          />
          <button class="cta-primary nl-btn">Subscribe</button>
        </div>
      </div>
    </section>
 
  </div>
</template>
 