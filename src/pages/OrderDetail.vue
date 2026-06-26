<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orderApi } from '@/services/api'

const route = useRoute()
const router = useRouter()

const order = ref(null)
const loading = ref(true)

onMounted(async () => {
  const id = route.params.id
  try {
    const response = await orderApi.getOne(id)
    order.value = response.data.data || response.data
  } catch (error) {
    console.error(error)
    if (error.response?.status === 404) {
      alert('Order not found')
      router.push('/orders')
    }
  } finally {
    loading.value = false
  }
})

const statusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'completed'
    case 'processing':
      return 'processing'
    case 'cancelled':
      return 'cancelled'
    default:
      return 'pending'
  }
}
</script>

<template>
  <div class="order-detail-page">
    <div class="container">
      <div v-if="loading" class="loading">Loading order...</div>

      <template v-else-if="order">
        <div class="page-header">
          <router-link to="/orders" class="back-link">← Back to Orders</router-link>
          <h1>Order #{{ order.id }}</h1>
          <p>{{ new Date(order.created_at).toLocaleDateString() }}</p>
        </div>

        <div class="order-header">
          <div>
            <h3>Order #{{ order.id }}</h3>
            <p>{{ new Date(order.created_at).toLocaleString() }}</p>
          </div>
          <span class="status" :class="statusClass(order.status)">
            {{ order.status }}
          </span>
        </div>

        <div class="order-items">
          <h2>Items</h2>
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <img :src="item.product?.image_url || (item.product?.image ? `http://localhost:8000/storage/images/${item.product.image}` : '/placeholder-product.jpg')" :alt="item.product?.name" class="item-image">
            <div class="item-details">
              <h4>{{ item.product?.name }}</h4>
              <p>Qty: {{ item.quantity }}</p>
            </div>
            <div class="item-price">${{ Number(item.price).toFixed(2) }}</div>
            <div class="item-total">${{ Number(item.price * item.quantity).toFixed(2) }}</div>
          </div>
        </div>

        <div class="order-summary">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>${{ Number(order.total).toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>${{ Number(order.total).toFixed(2) }}</span>
          </div>
        </div>

        <div class="order-info">
          <h3>Shipping Address</h3>
          <p>{{ order.shipping_address || 'N/A' }}</p>
          <h3>Payment Method</h3>
          <p>{{ order.payment_method || 'Cash on Delivery' }}</p>
        </div>
      </template>

      <div v-else class="empty-state">
        <h2>Order Not Found</h2>
        <router-link to="/orders" class="browse-btn">Back to Orders</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-detail-page {
  padding: 2rem 0;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.back-link {
  color: #6b7280;
  text-decoration: none;
  font-size: 0.9rem;
}

.back-link:hover {
  color: #111827;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.status {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status.pending { background: #fef3c7; color: #92400e; }
.status.processing { background: #dbeafe; color: #1e40af; }
.status.completed { background: #d1fae5; color: #065f46; }
.status.cancelled { background: #fee2e2; color: #991b1b; }

.order-items {
  margin-bottom: 2rem;
}

.order-item {
  display: grid;
  grid-template-columns: 80px 1fr auto auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  background: #f9fafb;
}

.item-details h4 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
}

.item-details p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.item-price, .item-total {
  font-weight: 600;
  white-space: nowrap;
}

.item-total {
  color: #111827;
}

.order-summary {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.summary-row.total {
  font-size: 1.25rem;
  font-weight: 700;
  border-top: 1px solid #e5e7eb;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
}

.order-info h3 {
  margin: 1.5rem 0 0.5rem;
  font-size: 1rem;
}

.order-info p {
  color: #6b7280;
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.browse-btn {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border-radius: 8px;
  text-decoration: none;
}

@media (max-width: 640px) {
  .order-item {
    grid-template-columns: 70px 1fr;
    grid-template-rows: auto auto auto;
  }
  .item-image {
    grid-row: 1 / 3;
  }
  .item-price, .item-total {
    grid-column: 2;
  }
}
</style>