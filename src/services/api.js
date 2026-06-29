import axios from 'axios'
import router from '@/router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Accept': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Debug: log request
  console.log('API Request:', config.method?.toUpperCase(), config.url, config.data)
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  getProfile: () => api.get('/me'),
updateProfile: (data) => {
    // Check if there's a file to upload
    const hasFile = data.avatar && data.avatar instanceof File
    
    if (hasFile) {
      const formData = new FormData()
      Object.keys(data).forEach(key => {
        let value = data[key]
        if (value instanceof File) {
          formData.append(key, value)
        } else if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value)
        }
      })
      // Use POST with _method=PUT for Laravel method spoofing (handles multipart properly)
      formData.append('_method', 'PUT')
      return api.post('/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
    
    // Send as JSON when no file
    return api.put('/me', data)
  },
  updatePassword: (data) => api.put('/me/password', data),
}

export const productApi = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  search: (q) => api.get('/products/search', { params: { q } }),
}

export const categoryApi = {
  getAll: () => api.get('/categories'),
}

export const cartApi = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  update: (id, data) => api.put(`/cart/${id}`, data),
  remove: (id) => api.delete(`/cart/${id}`),
}

export const wishlistApi = {
  get: () => api.get('/wishlist'),
  add: (data) => api.post('/wishlist', data),
  remove: (id) => api.delete(`/wishlist/${id}`),
}

export const orderApi = {
  checkout: (data) => api.post('/checkout', data),
  getAll: () => api.get('/orders'),
  getOne: (id) => api.get(`/orders/${id}`),
}

export const reviewApi = {
  add: (productId, data) => api.post('/review', { ...data, product_id: productId }),
  get: (productId) => api.get(`/products/${productId}/reviews`),
}

export default api