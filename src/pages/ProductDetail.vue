<template>
  <div class="page-detail">
    <div class="container">
      <div v-if="loading" class="loading">Loading...</div>
      <template v-else-if="product">
        <!-- Breadcrumb -->
        <p class="breadcrumb">
          <router-link to="/">Home</router-link> /
          <router-link to="/products">Products</router-link> /
          {{ product.name }}
        </p>

        <!-- Product Top -->
        <div class="product-top">
          <div class="product-gallery">
            <img
              :src="product.image_url || (product.image ? `http://localhost:8000/storage/images/${product.image}` : '/placeholder.png')"
              :alt="product.name"
              class="main-img"
            />
          </div>

          <div class="product-info">
            <span class="category-badge">{{ product.category?.name }}</span>
            <h1>{{ product.name }}</h1>
            <div class="price-row">
              <span class="price">${{ Number(product.price).toFixed(2) }}</span>
              <span class="stock" :class="{ 'out': product.stock === 0 }">
                {{ product.stock > 0 ? `${product.stock} in stock` : 'Out of stock' }}
              </span>
            </div>
            <p class="description">{{ product.description }}</p>

            <div class="qty-row">
              <label>Qty:</label>
              <div class="qty-control">
                <button @click="qty > 1 && qty--">−</button>
                <span>{{ qty }}</span>
                <button @click="qty++">+</button>
              </div>
            </div>

            <div class="action-row">
              <button @click="handleAddToCart" class="btn-cart" :disabled="product.stock === 0">
                🛒 Add to Cart
              </button>
              <button @click="handleWishlist" class="btn-wish" :class="{ wished: inWishlist }">
                {{ inWishlist ? '❤️' : '🤍' }} Wishlist
              </button>
            </div>
          </div>
        </div>

        <!-- Reviews Section -->
        <div class="reviews-section">
          <h2>Customer Reviews</h2>

          <!-- Submit Review -->
          <div v-if="authStore.isAuthenticated" class="review-form">
            <h3>Write a Review</h3>
            <div class="star-select">
              <span
                v-for="i in 5"
                :key="i"
                @click="newReview.rating = i"
                :class="{ filled: i <= newReview.rating }"
              >★</span>
            </div>
            <textarea v-model="newReview.comment" placeholder="Share your experience..." class="textarea" rows="3"></textarea>
            <button @click="submitReview" class="btn-submit" :disabled="submitting">
              {{ submitting ? 'Submitting...' : 'Submit Review' }}
            </button>
          </div>

          <div v-if="reviews.length === 0" class="no-reviews">No reviews yet. Be the first!</div>
          <div class="reviews-list">
            <ReviewCard v-for="r in reviews" :key="r.id" :review="r" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ReviewCard from '@/components/ReviewCard.vue'
import { productApi, cartApi, wishlistApi, reviewApi } from '@/services/api'
import { useAuthStore, useWishlistStore, useCartStore } from '@/store'
import '@/assets/css/ProductDetail.css'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const wishlistStore = useWishlistStore()
const cartStore = useCartStore()

const product = ref(null)
const reviews = ref([])
const loading = ref(true)
const qty = ref(1)
const inWishlist = ref(false)
const submitting = ref(false)
const newReview = reactive({ rating: 5, comment: '' })

onMounted(async () => {
  const id = route.params.id
  try {
    const [prodRes, revRes] = await Promise.all([
      productApi.getOne(id),
      reviewApi.get(id)
    ])
    product.value = prodRes.data.data || prodRes.data
    reviews.value = revRes.data.data || revRes.data

    if (authStore.isAuthenticated) {
      const wRes = await wishlistApi.get()
      const wishlist = wRes.data.data || wRes.data
      inWishlist.value = wishlist.some((w) => w.product_id == id)
    }
  } catch (e) {
    console.error('ProductDetail error:', e)
    if (e.response?.status === 404) {
      alert('Product not found')
      router.push('/products')
    }
  } finally {
    loading.value = false
  }
})

const handleAddToCart = async () => {
  if (!authStore.isAuthenticated) return router.push('/login')
  try {
    await cartApi.add({ product_id: product.value.id, quantity: qty.value })
    cartStore.addItem({ ...product.value, quantity: qty.value })
    alert('Added to cart!')
  } catch (e) {
    alert(e.response?.data?.message || 'Error')
  }
}

const handleWishlist = async () => {
  if (!authStore.isAuthenticated) return router.push('/login')
  try {
    if (inWishlist.value) {
      const wRes = await wishlistApi.get()
      const entry = (wRes.data.data || wRes.data).find((w) => w.product_id == product.value.id)
      if (entry) {
        await wishlistApi.remove(entry.id)
        wishlistStore.removeItem(product.value.id)
        inWishlist.value = false
      }
    } else {
      try {
        await wishlistApi.add({ product_id: product.value.id })
        wishlistStore.addItem(product.value)
        inWishlist.value = true
      } catch (addError) {
        if (addError.response?.status === 400 && addError.response?.data?.message?.includes('Already in wishlist')) {
          const wRes = await wishlistApi.get()
          const entry = (wRes.data.data || wRes.data).find((w) => w.product_id == product.value.id)
          if (entry) {
            await wishlistApi.remove(entry.id)
            wishlistStore.removeItem(product.value.id)
            inWishlist.value = false
          }
        } else {
          throw addError
        }
      }
    }
  } catch (e) {
    console.error('Wishlist error:', e)
    if (e.response?.status === 400) {
      alert('Failed to update wishlist: ' + (e.response.data?.message || 'Invalid request'))
    } else {
      alert(e.response?.data?.message || 'Error')
    }
  }
}

const submitReview = async () => {
  if (!newReview.comment.trim()) return alert('Please write a comment.')
  submitting.value = true
  try {
    const res = await reviewApi.add(product.value.id, newReview)
    reviews.value.unshift(res.data.data || res.data)
    newReview.comment = ''
    newReview.rating = 5
  } catch (e) {
    alert(e.response?.data?.message || 'Error submitting review')
  } finally {
    submitting.value = false
  }
}
</script>

