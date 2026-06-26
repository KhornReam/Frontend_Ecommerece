<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { wishlistApi, cartApi } from '@/services/api'
import { useAuthStore, useWishlistStore, useCartStore } from '@/store'
import ProductCard from '@/components/ProductCard.vue'
import '@/assets/css/Wishlist.css'

const router = useRouter()
const authStore = useAuthStore()
const wishlistStore = useWishlistStore()
const cartStore = useCartStore()

const loading = ref(true)
const removing = ref({})

const fetchWishlist = async () => {
  if (!authStore.isAuthenticated) return
  loading.value = true
  try {
    const response = await wishlistApi.get()
    wishlistStore.setWishlist(response.data.data || [])
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const removeFromWishlist = async (productId) => {
  removing.value[productId] = true
  try {
    const response = await wishlistApi.get()
    const item = response.data.data.find(w => w.product_id === productId)
    if (item) {
      await wishlistApi.remove(item.id)
      wishlistStore.removeItem(productId)
    }
  } catch (error) {
    console.error(error)
    alert('Failed to remove from wishlist')
  } finally {
    removing.value[productId] = false
  }
}

const addToCart = async (product) => {
  if (!authStore.isAuthenticated) return router.push('/login')
  try {
    await cartApi.add({ product_id: product.id, quantity: 1 })
    cartStore.addItem({ ...product, quantity: 1 })
    alert('Added to cart!')
  } catch (error) {
    console.error(error)
    alert(error.response?.data?.message || 'Error')
  }
}

onMounted(() => {
  fetchWishlist()
})
</script>

<template>
  <div class="wishlist-page">
    <div class="container">
      <div class="page-header">
        <h1>My Wishlist</h1>
        <p>Your saved items</p>
      </div>

      <div v-if="loading" class="loading">Loading wishlist...</div>

      <div v-else-if="wishlistStore.items.length === 0" class="empty-state">
        <h2>Your Wishlist is Empty</h2>
        <p>Save products you love for later.</p>
        <RouterLink to="/products" class="browse-btn">Browse Products</RouterLink>
      </div>

      <div v-else class="product-grid">
        <ProductCard
          v-for="item in wishlistStore.items"
          :key="item.id"
          :product="item.product"
          @added-to-cart="addToCart"
        >
          <template #actions>
            <button
              class="action-btn remove"
              @click.stop="removeFromWishlist(item.id)"
              :disabled="removing[item.id]"
              title="Remove from wishlist"
            >
              <span v-if="removing[item.id]">...</span>
              <span v-else>✕</span>
            </button>
          </template>
        </ProductCard>
      </div>
    </div>
  </div>
</template>

