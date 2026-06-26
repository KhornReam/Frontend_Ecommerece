<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore, useWishlistStore } from '@/store'
import { cartApi, wishlistApi } from '@/services/api'
import '@/assets/css/ProductCard.css'
 
const router = useRouter()
 
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})
 
const emit = defineEmits(['added-to-cart', 'added-to-wishlist'])
 
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const addingToCart = ref(false)
const addingToWishlist = ref(false)
const justAdded = ref(false)
 
const imageUrl = computed(() => {
  if (props.product.image_url) return props.product.image_url
  if (props.product.image) return `http://localhost:8000/storage/images/${props.product.image}`
  return '/placeholder-product.jpg'
})
 
const inWishlist = computed(() => wishlistStore.isInWishlist(props.product.id))
 
const discountPercent = computed(() => {
  if (!props.product.sale_price) return null
  const original = Number(props.product.sale_price)
  const current = Number(props.product.price)
  return Math.round(((original - current) / original) * 100)
})
 
async function addToCart(e) {
  e.stopPropagation()
  if (addingToCart.value || props.product.stock <= 0) return
  addingToCart.value = true
  try {
    await cartApi.add({ product_id: props.product.id, quantity: 1 })
    cartStore.addItem({ ...props.product, quantity: 1 })
    emit('added-to-cart', props.product)
    justAdded.value = true
    setTimeout(() => (justAdded.value = false), 1800)
  } catch (error) {
    console.error('Add to cart failed:', error)
  } finally {
    addingToCart.value = false
  }
}
 
async function toggleWishlist(e) {
  e.stopPropagation()
  addingToWishlist.value = true
  try {
    if (inWishlist.value) {
      const response = await wishlistApi.get()
      const wishlistItems = response.data.data || response.data
      const entry = wishlistItems.find(w => w.product_id === props.product.id)
      if (entry) {
        await wishlistApi.remove(entry.id)
        wishlistStore.removeItem(entry.id)
      }
    } else {
      try {
        await wishlistApi.add({ product_id: props.product.id })
        wishlistStore.addItem(props.product)
      } catch (addError) {
        if (addError.response?.status === 400 && addError.response?.data?.message?.includes('Already in wishlist')) {
          const response = await wishlistApi.get()
          const wishlistItems = response.data.data || response.data
          const entry = wishlistItems.find(w => w.product_id === props.product.id)
          if (entry) {
            await wishlistApi.remove(entry.id)
            wishlistStore.removeItem(entry.id)
          }
        } else {
          throw addError
        }
      }
    }
    emit('added-to-wishlist', props.product)
  } catch (error) {
    console.error('Wishlist toggle failed:', error)
    if (error.response?.status === 400) {
      alert('Failed to update wishlist: ' + (error.response.data?.message || 'Invalid request'))
    }
  } finally {
    addingToWishlist.value = false
  }
}
 
function goToDetail() {
  router.push(`/products/${props.product.id}`)
}
</script>
 
<template>
  <article class="pc" @click="goToDetail">
 
    <!-- ── Image zone ── -->
    <div class="pc__media">
      <img
        :src="imageUrl"
        :alt="product.name"
        class="pc__img"
        loading="lazy"
      />
 
      <!-- Gradient scrim so slide-up panel reads cleanly -->
      <div class="pc__scrim" />
 
      <!-- Discount pill -->
      <span v-if="discountPercent" class="pc__pill pc__pill--discount">
        −{{ discountPercent }}%
      </span>
 
      <!-- Wishlist toggle -->
      <button
        class="pc__wish"
        :class="{ 'pc__wish--active': inWishlist }"
        :disabled="addingToWishlist"
        :aria-label="inWishlist ? 'Remove from wishlist' : 'Add to wishlist'"
        @click="toggleWishlist"
      >
        <!-- Filled heart -->
        <svg v-if="inWishlist" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <!-- Outline heart -->
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
 
      <!-- Slide-up add-to-cart strip — the signature interaction -->
      <div class="pc__strip">
        <button
          class="pc__strip-btn"
          :disabled="addingToCart || product.stock <= 0"
          @click="addToCart"
        >
          <span v-if="justAdded" class="pc__strip-label pc__strip-label--confirm">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd"/></svg>
            Added
          </span>
          <span v-else-if="addingToCart" class="pc__strip-label">···</span>
          <span v-else-if="product.stock <= 0" class="pc__strip-label pc__strip-label--oos">Out of stock</span>
          <span v-else class="pc__strip-label">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M1 1.75A.75.75 0 0 1 1.75 1h1.628a1.75 1.75 0 0 1 1.734 1.51L5.18 3a65.25 65.25 0 0 1 13.36 1.412.75.75 0 0 1 .58.875 48.645 48.645 0 0 1-1.618 6.2.75.75 0 0 1-.712.513H6a2.503 2.503 0 0 0-2.292 1.5H17.25a.75.75 0 0 1 0 1.5H2.76a.75.75 0 0 1-.748-.807 4.002 4.002 0 0 1 2.716-3.486L3.626 2.716a.25.25 0 0 0-.248-.216H1.75A.75.75 0 0 1 1 1.75ZM6 17.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM15.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/></svg>
            Add to cart
          </span>
        </button>
      </div>
    </div>
 
    <!-- ── Info zone ── -->
    <div class="pc__body">
      <p class="pc__cat">{{ product.category?.name || 'Uncategorized' }}</p>
      <h3 class="pc__name">{{ product.name }}</h3>
 
      <div class="pc__footer">
        <div class="pc__pricing">
          <span class="pc__price">{{ Number(product.price).toFixed(2) }}</span>
          <span class="pc__currency">USD</span>
          <span v-if="product.sale_price" class="pc__was">${{ Number(product.sale_price).toFixed(2) }}</span>
        </div>
 
        <!-- Stock indicator -->
        <span v-if="product.stock > 0 && product.stock <= 5" class="pc__stock-warn">
          Only {{ product.stock }} left
        </span>
        <span v-else-if="product.stock <= 0" class="pc__stock-oos">Sold out</span>
      </div>
    </div>
 
  </article>
</template>
 
<style scoped>

</style>