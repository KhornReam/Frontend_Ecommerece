<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { cartApi, orderApi } from '@/services/api'
import { useAuthStore, useCartStore } from '@/store'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const loading = ref(false)
const submitting = ref(false)
const errors = ref({})

const form = reactive({
  shipping_address: '',
  shipping_city: '',
  shipping_state: '',
  shipping_zip: '',
  shipping_country: '',
  phone: '',
  payment_method: 'cash_on_delivery',
  notes: '',
})

const fetchCart = async () => {
  if (!authStore.isAuthenticated) return
  try {
    const response = await cartApi.get()
    cartStore.setCart(response.data.data || [])
  } catch (error) {
    console.error(error)
  }
}

const submitOrder = async () => {
  errors.value = {}
  submitting.value = true

  if (cartStore.items.length === 0) {
    alert('Cart is empty')
    submitting.value = false
    return
  }

  // Validate required fields
  const required = ['shipping_address', 'shipping_city', 'shipping_state', 'shipping_zip', 'shipping_country', 'phone']
  for (const field of required) {
    if (!form[field]) {
      errors.value[field] = ['This field is required']
    }
  }

  if (Object.keys(errors.value).length > 0) {
    submitting.value = false
    return
  }

  try {
    const response = await orderApi.checkout({
      items: cartStore.items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
      shipping_address: form.shipping_address,
      shipping_city: form.shipping_city,
      shipping_state: form.shipping_state,
      shipping_zip: form.shipping_zip,
      shipping_country: form.shipping_country,
      phone: form.phone,
      payment_method: form.payment_method,
      notes: form.notes,
    })

    cartStore.clear()
    router.push(`/orders/${response.data.data.id}`)
  } catch (error) {
    console.error(error)
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else if (error.response?.data?.message) {
      errors.value.general = [error.response.data.message]
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchCart()
})
</script>

<template>
  <div class="checkout-page">
    <div class="container">
      <div class="page-header">
        <h1>Checkout</h1>
        <p>Complete your order</p>
      </div>

      <div v-if="cartStore.items.length === 0" class="empty-state">
        <h2>Your Cart is Empty</h2>
        <p>Add some products before checking out.</p>
        <RouterLink to="/products" class="browse-btn">Browse Products</RouterLink>
      </div>

      <div v-else class="checkout-layout">
        <div class="checkout-form">
          <form @submit.prevent="submitOrder">
            <div v-if="errors.general" class="error-general">
              {{ errors.general[0] }}
            </div>

            <section class="form-section">
              <h2>Shipping Information</h2>

              <div class="form-row">
                <div class="form-group">
                  <label>Full Address *</label>
                  <textarea v-model="form.shipping_address" rows="2" placeholder="Street address, apartment, suite, etc." />
                  <small v-if="errors.shipping_address" class="error">{{ errors.shipping_address[0] }}</small>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>City *</label>
                  <input v-model="form.shipping_city" type="text" placeholder="City" />
                  <small v-if="errors.shipping_city" class="error">{{ errors.shipping_city[0] }}</small>
                </div>
                <div class="form-group">
                  <label>State / Province *</label>
                  <input v-model="form.shipping_state" type="text" placeholder="State/Province" />
                  <small v-if="errors.shipping_state" class="error">{{ errors.shipping_state[0] }}</small>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>ZIP / Postal Code *</label>
                  <input v-model="form.shipping_zip" type="text" placeholder="ZIP Code" />
                  <small v-if="errors.shipping_zip" class="error">{{ errors.shipping_zip[0] }}</small>
                </div>
                <div class="form-group">
                  <label>Country *</label>
                  <input v-model="form.shipping_country" type="text" placeholder="Country" />
                  <small v-if="errors.shipping_country" class="error">{{ errors.shipping_country[0] }}</small>
                </div>
              </div>

              <div class="form-group">
                <label>Phone Number *</label>
                <input v-model="form.phone" type="tel" placeholder="+1 (555) 000-0000" />
                <small v-if="errors.phone" class="error">{{ errors.phone[0] }}</small>
              </div>
            </section>

            <section class="form-section">
              <h2>Payment Method</h2>

              <div class="payment-options">
                <label class="payment-option">
                  <input type="radio" v-model="form.payment_method" value="cash_on_delivery" />
                  <span class="payment-label">
                    <strong>Cash on Delivery</strong>
                    <small>Pay when you receive your order</small>
                  </span>
                </label>

                <label class="payment-option">
                  <input type="radio" v-model="form.payment_method" value="card" />
                  <span class="payment-label">
                    <strong>Credit / Debit Card</strong>
                    <small>Pay securely with Stripe (coming soon)</small>
                  </span>
                </label>
              </div>
            </section>

            <section class="form-section">
              <h2>Order Notes (Optional)</h2>
              <textarea v-model="form.notes" rows="3" placeholder="Any special instructions for your order..." />
            </section>

            <button type="submit" :disabled="submitting" class="place-order-btn">
              {{ submitting ? 'Placing Order...' : `Place Order - $${cartStore.totalPrice.toFixed(2)}` }}
            </button>
          </form>
        </div>

        <div class="order-summary">
          <h2>Order Summary</h2>

          <div class="summary-items">
            <div v-for="item in cartStore.items" :key="item.id" class="summary-item">
              <div class="item-info">
                <img :src="item.image_url || (item.image ? `http://localhost:8000/storage/images/${item.image}` : '/placeholder-product.jpg')" :alt="item.name" class="item-image">
                <div>
                  <h4>{{ item.name }}</h4>
                  <p>Qty: {{ item.quantity }}</p>
                </div>
              </div>
              <span class="item-price">${{ Number(item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>

          <div class="summary-totals">
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
          </div>

          <p class="secure-note">🔒 Secure checkout - Your information is encrypted</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-page {
  padding: 40px 0;
  background: #f8fafc;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: auto;
  padding: 0 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  margin: 0;
  color: #111827;
}

.page-header p {
  color: #6b7280;
}

.empty-state {
  text-align: center;
  background: white;
  padding: 60px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.empty-state h2 {
  margin: 0 0 10px;
  color: #111827;
}

.empty-state p {
  color: #6b7280;
  margin: 0 0 20px;
}

.browse-btn {
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
}

.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 30px;
}

@media (max-width: 900px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
}

.checkout-form {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.form-section {
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #f3f4f6;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h2 {
  margin: 0 0 20px;
  color: #111827;
  font-size: 16px;
  font-weight: 700;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-group .error {
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.error-general {
  background: #fef2f2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-option:hover {
  border-color: #d1d5db;
}

.payment-option:has(input:checked) {
  border-color: #3b82f6;
  background: #eff6ff;
}

.payment-option input[type="radio"] {
  width: 18px;
  height: 18px;
  accent-color: #3b82f6;
}

.payment-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.payment-label strong {
  color: #111827;
  font-size: 14px;
}

.payment-label small {
  color: #6b7280;
  font-size: 12px;
}

.place-order-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.place-order-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.place-order-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.order-summary {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  height: fit-content;
  position: sticky;
  top: 100px;
}

.order-summary h2 {
  margin: 0 0 20px;
  color: #111827;
  font-size: 18px;
}

.summary-items {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f3f4f6;
}

.summary-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  background: #f9fafb;
}

.item-info h4 {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.item-info p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.item-price {
  margin-left: auto;
  font-weight: 600;
  color: #111827;
}

.summary-totals {
  border-top: 1px solid #f3f4f6;
  padding-top: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  color: #6b7280;
}

.summary-row.total {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  border-top: 2px solid #e5e7eb;
  margin-top: 8px;
  padding-top: 16px;
}

.secure-note {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
  color: #9ca3af;
}
</style>