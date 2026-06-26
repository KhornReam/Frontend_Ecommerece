<script setup>
import { computed } from 'vue'

const props = defineProps({
  review: {
    type: Object,
    required: true,
  },
})

const initials = computed(() => {
  const name = props.review.user?.name || 'Anonymous'

  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const stars = computed(() => {
  const rating = props.review.rating || 0

  return Array.from(
    { length: 5 },
    (_, i) => (i < rating ? 'full' : 'empty')
  )
})

const formattedDate = computed(() => {
  if (!props.review.created_at) return ''

  return new Date(props.review.created_at).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  )
})
</script>

<template>
  <article class="review-card">
    <div class="review-header">
      <div class="reviewer-info">
        <div class="avatar">
          {{ initials }}
        </div>

        <div>
          <h4>
            {{ props.review.user?.name || 'Anonymous' }}
          </h4>

          <span class="review-date">
            {{ formattedDate }}
          </span>
        </div>
      </div>

      <div class="rating" aria-label="Rating">
        <span
          v-for="(star, i) in stars"
          :key="i"
          class="star"
          :class="star"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            />
          </svg>
        </span>
      </div>
    </div>

    <p
      v-if="props.review.comment"
      class="review-text"
    >
      {{ props.review.comment }}
    </p>
  </article>
</template>

<style scoped>
.review-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.review-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    #3b82f6,
    #8b5cf6
  );
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.reviewer-info h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.review-date {
  display: block;
  margin-top: 3px;
  font-size: 12px;
  color: #9ca3af;
}

.rating {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.star {
  color: #d1d5db;
}

.star.full {
  color: #fbbf24;
}

.review-text {
  margin: 0;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.7;
}
</style>