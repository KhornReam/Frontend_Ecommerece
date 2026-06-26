<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { orderApi } from '@/services/api'
import '@/assets/css/Order.css'

const orders = ref([])
const loading = ref(true)

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

onMounted(async () => {
  try {
    const response = await orderApi.getAll()
    orders.value = response.data.data?.data || response.data.data || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="orders-page">
    <div class="container">

      <div class="page-header">
        <h1>My Orders</h1>
        <p>Track and manage your purchases</p>
      </div>

      <div v-if="loading" class="loading">
        Loading orders...
      </div>

      <div v-else-if="orders.length === 0" class="empty-state">
        <h2>No Orders Found</h2>
        <p>You haven't placed any orders yet.</p>
      </div>

      <div v-else class="orders-list">
        <div
          v-for="order in orders"
          :key="order.id"
          class="order-card"
        >
          <div class="order-header">
            <div>
              <h3>Order #{{ order.id }}</h3>
              <p>
                {{ new Date(order.created_at).toLocaleDateString() }}
              </p>
            </div>

            <span
              class="status"
              :class="statusClass(order.status)"
            >
              {{ order.status }}
            </span>
          </div>

          <div class="order-body">

            <div class="info-box">
              <span>Total Amount</span>
              <strong>
                ${{ Number(order.total_amount).toLocaleString() }}
              </strong>
            </div>

            <div class="info-box">
              <span>Items</span>
              <strong>
                {{ order.items_count || 0 }}
              </strong>
            </div>

            <div class="info-box">
              <span>Payment</span>
              <strong>
                {{ order.payment_method || 'Cash' }}
              </strong>
            </div>

          </div>

          <div class="order-footer">
            <RouterLink
              :to="`/orders/${order.id}`"
              class="details-btn"
            >
              View Details
            </RouterLink>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
