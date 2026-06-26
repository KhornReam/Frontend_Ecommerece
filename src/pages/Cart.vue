<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { cartApi, orderApi } from '@/services/api'
import { useAuthStore, useCartStore } from '@/store'
import '@/assets/css/cart.css'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const loading = ref(false)
const updating = ref({})

const fetchCart = async () => {
  if (!authStore.isAuthenticated) return
  loading.value = true
  try {
    const response = await cartApi.get()
    cartStore.setCart(response.data.data || [])
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const updateQuantity = async (item, quantity) => {
  if (quantity < 1) return removeItem(item.id)
  updating.value[item.id] = true
  try {
    await cartApi.update(item.id, { quantity })
    cartStore.updateQuantity(item.id, quantity)
  } catch (error) {
    console.error(error)
    alert('Failed to update quantity')
  } finally {
    updating.value[item.id] = false
  }
}

const removeItem = async (id) => {
  updating.value[id] = true
  try {
    await cartApi.remove(id)
    cartStore.removeItem(id)
  } catch (error) {
    console.error(error)
    alert('Failed to remove item')
  } finally {
    updating.value[id] = false
  }
}

const checkout = async () => {
  if (cartStore.items.length === 0) return
  loading.value = true
  try {
    const response = await orderApi.checkout({ items: cartStore.items })
    cartStore.clear()
    router.push(`/orders/${response.data.order.id}`)
  } catch (error) {
    console.error(error)
    alert(error.response?.data?.message || 'Checkout failed')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCart()
})
</script>

<template>
  <div class="cart-page">
    <div class="container">
      <div class="page-header">
        <h1>Shopping Cart</h1>
      </div>

      <div v-if="loading" class="loading">Loading cart...</div>

      <div v-else-if="cartStore.items.length === 0" class="empty-state">
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added any products yet.</p>
        <RouterLink to="/products" class="continue-btn">Continue Shopping</RouterLink>
      </div>

      <div v-else class="cart-layout">
        <div class="cart-items">
          <div class="cart-header">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
            <span></span>
          </div>

          <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
            <div class="item-info">
              <img :src="item.product?.image_url || (item.product?.image ? `http://localhost:8000/storage/images/${item.product.image}` : '/placeholder-product.jpg')" :alt="item.name" class="item-image">
              <div class="item-details">
                <h3>{{ item.name }}</h3>
                <p v-if="item.category">{{ item.category.name }}</p>
              </div>
            </div>

            <div class="item-price">${{ Number(item.price).toFixed(2) }}</div>

            <div class="item-quantity">
              <button @click="updateQuantity(item, item.quantity - 1)" :disabled="updating[item.id]" class="qty-btn">−</button>
              <span>{{ item.quantity }}</span>
              <button @click="updateQuantity(item, item.quantity + 1)" :disabled="updating[item.id]" class="qty-btn">+</button>
            </div>

            <div class="item-total">${{ Number(item.price * item.quantity).toFixed(2) }}</div>

            <button @click="removeItem(item.id)" :disabled="updating[item.id]" class="remove-btn" title="Remove">✕</button>
          </div>
        </div>

        <div class="cart-summary">
          <h2>Order Summary</h2>
          <div class="summary-row">
            <span>Subtotal</span>
            <span>${{ cartStore.totalPrice.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>${{ cartStore.totalPrice.toFixed(2) }}</span>
          </div>
          <button @click="checkout" :disabled="loading" class="checkout-btn">
            {{ loading ? 'Processing...' : `Checkout - $${cartStore.totalPrice.toFixed(2)}` }}
          </button>
          <RouterLink to="/products" class="continue-shopping">Continue Shopping</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>