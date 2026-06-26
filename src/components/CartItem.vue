<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/store'
import { cartApi } from '@/services/api'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['updated', 'removed'])

const cartStore = useCartStore()
const updating = ref(false)

const imageUrl = computed(() => {
  if (props.item.product?.image_url) return props.item.product.image_url
  if (props.item.product?.image) return `http://localhost:8000/storage/images/${props.item.product.image}`
  return '/placeholder-product.jpg'
})

const productName = computed(() => props.item.product?.name || props.item.name || 'Unknown Product')
const productPrice = computed(() => props.item.product?.price || props.item.price || 0)
const lineTotal = computed(() => productPrice.value * props.item.quantity)

async function updateQuantity(newQty) {
  if (newQty < 1) return removeItem()
  updating.value = true
  try {
    await cartApi.update(props.item.id, { quantity: newQty })
    cartStore.updateQuantity(props.item.id, newQty)
    emit('updated', props.item.id, newQty)
  } catch (error) {
    console.error('Update quantity failed:', error)
  } finally {
    updating.value = false
  }
}

async function removeItem() {
  if (!confirm('Remove this item from cart?')) return
  updating.value = true
  try {
    await cartApi.remove(props.item.id)
    cartStore.removeItem(props.item.id)
    emit('removed', props.item.id)
  } catch (error) {
    console.error('Remove item failed:', error)
  } finally {
    updating.value = false
  }
}
</script>

<template>
  <div class="cart-item">
    <img :src="imageUrl" :alt="productName" class="item-image" loading="lazy">

    <div class="item-details">
      <h4 class="item-name">{{ productName }}</h4>
      <p class="item-price">${{ Number(productPrice).toFixed(2) }} each</p>

      <div class="quantity-control">
        <button 
          class="qty-btn" 
          @click="updateQuantity(item.quantity - 1)"
          :disabled="item.quantity <= 1 || updating"
          aria-label="Decrease quantity"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <span class="qty-value">{{ item.quantity }}</span>
        <button 
          class="qty-btn" 
          @click="updateQuantity(item.quantity + 1)"
          :disabled="updating"
          aria-label="Increase quantity"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
    </div>

    <div class="item-total-section">
      <div class="item-total">${{ lineTotal.toFixed(2) }}</div>
      <button 
        class="remove-btn" 
        @click="removeItem"
        :disabled="updating"
        title="Remove from cart"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.cart-item {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: box-shadow 0.2s;
}

.cart-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 10px;
  background: #f9fafb;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.item-name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-price {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #4b5563;
  transition: all 0.2s;
}

.qty-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-value {
  min-width: 40px;
  text-align: center;
  font-weight: 600;
  font-size: 15px;
  color: #111827;
}

.item-total-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.item-total {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
}

.remove-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover:not(:disabled) {
  background: #fef2f2;
  color: #ef4444;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .cart-item {
    grid-template-columns: 70px 1fr;
    grid-template-rows: auto auto;
  }
  .item-total-section {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
}
</style>