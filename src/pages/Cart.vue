<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { cartApi, orderApi } from '@/services/api'
import { useAuthStore, useCartStore} from '@/store'
import '@/assets/css/cart.css'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const loading = ref(false)
const updating = ref({})
const showPaymentModal = ref(false)
const paymentProcessing = ref(false)
const paymentForm = reactive({
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  cardName: '',
})

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

const openPaymentModal = () => {
  if (cartStore.items.length === 0) return
  showPaymentModal.value = true
}

const closePaymentModal = () => {
  showPaymentModal.value = false
  paymentForm.cardNumber = ''
  paymentForm.expiryDate = ''
  paymentForm.cvv = ''
  paymentForm.cardName = ''
}

const processPayment = async () => {
  if (!paymentForm.cardNumber || !paymentForm.expiryDate || !paymentForm.cvv || !paymentForm.cardName) {
    alert('Please fill in all payment details')
    return
  }
  
  paymentProcessing.value = true
  try {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Create order after successful "payment"
    const response = await orderApi.checkout({ items: cartStore.items })
    cartStore.clear()
    closePaymentModal()
    router.push(`/orders/${response.data.order.id}`)
  } catch (error) {
    console.error(error)
    alert(error.response?.data?.message || 'Payment failed')
  } finally {
    paymentProcessing.value = false
  }
}

const formatCardNumber = (e) => {
  let value = e.target.value.replace(/\D/g, '')
  value = value.replace(/(\d{4})/g, '$1 ').trim()
  paymentForm.cardNumber = value.substring(0, 19)
}

const formatExpiryDate = (e) => {
  let value = e.target.value.replace(/\D/g, '')
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4)
  }
  paymentForm.expiryDate = value.substring(0, 5)
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
          <button @click="openPaymentModal" :disabled="loading" class="checkout-btn">
            {{ loading ? 'Processing...' : `Checkout - $${cartStore.totalPrice.toFixed(2)}` }}
          </button>
          <RouterLink to="/products" class="continue-shopping">Continue Shopping</RouterLink>
</div>
    </div>
  </div>
</div>

<!-- Payment Modal -->
<Teleport to="body">
  <transition name="modal-fade">
    <div v-if="showPaymentModal" class="modal-overlay" @click.self="closePaymentModal">
      <div class="modal-content payment-modal">
        <div class="modal-header">
          <h2>Payment Details</h2>
          <button @click="closePaymentModal" class="modal-close" :disabled="paymentProcessing">✕</button>
        </div>
        <div class="modal-body">
          <p class="payment-total">Total: <strong>${{ cartStore.totalPrice.toFixed(2) }}</strong></p>
          
          <form @submit.prevent="processPayment">
            <div class="form-group">
              <label>Card Number</label>
              <input 
                v-model="paymentForm.cardNumber" 
                type="text" 
                placeholder="4242 4242 4242 4242"
                maxlength="19"
                @input="formatCardNumber"
                :disabled="paymentProcessing"
                required
              >
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Expiry Date</label>
                <input 
                  v-model="paymentForm.expiryDate" 
                  type="text" 
                  placeholder="MM/YY"
                  maxlength="5"
                  @input="formatExpiryDate"
                  :disabled="paymentProcessing"
                  required
                >
              </div>
              <div class="form-group">
                <label>CVV</label>
                <input 
                  v-model="paymentForm.cvv" 
                  type="password" 
                  placeholder="123"
                  maxlength="4"
                  :disabled="paymentProcessing"
                  required
                >
              </div>
            </div>
            
            <div class="form-group">
              <label>Name on Card</label>
              <input 
                v-model="paymentForm.cardName" 
                type="text" 
                placeholder="John Doe"
                :disabled="paymentProcessing"
                required
              >
            </div>
            
            <p class="fake-payment-notice">💡 This is a fake payment for demo. Use any test card: 4242 4242 4242 4242</p>
            
            <button 
              type="submit" 
              :disabled="paymentProcessing"
              class="pay-btn"
            >
              {{ paymentProcessing ? 'Processing Payment...' : `Pay $${cartStore.totalPrice.toFixed(2)}` }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </transition>
</Teleport>
</template>
