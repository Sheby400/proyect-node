import { defineStore } from 'pinia'
import type { Cart, Order } from '~/types/api'

export const useCartStore = defineStore('cart', () => {
  const cart = ref<Cart>({
    items: [],
    total: 0
  })
  const loading = ref(false)
  const error = ref('')

  const itemCount = computed(() =>
    cart.value.items.reduce((total, item) => total + item.quantity, 0)
  )

  async function fetchCart() {
    loading.value = true
    error.value = ''

    try {
      const api = useApi()
      cart.value = await api.request<Cart>('/cart', { auth: true })
    } catch (unknownError) {
      error.value =
        unknownError instanceof Error
          ? unknownError.message
          : 'No se pudo cargar el carrito'
    } finally {
      loading.value = false
    }
  }

  async function addItem(productId: string, quantity = 1) {
    const api = useApi()
    cart.value = await api.request<Cart, { productId: string, quantity: number }>(
      '/cart/items',
      {
        method: 'POST',
        body: {
          productId,
          quantity
        },
        auth: true
      }
    )
  }

  async function removeItem(productId: string) {
    const api = useApi()
    cart.value = await api.request<Cart>(`/cart/items/${productId}`, {
      method: 'DELETE',
      auth: true
    })
  }

  async function checkout() {
    const api = useApi()
    const order = await api.request<Order>('/orders', {
      method: 'POST',
      auth: true
    })

    cart.value = {
      items: [],
      total: 0
    }

    return order
  }

  return {
    cart,
    loading,
    error,
    itemCount,
    fetchCart,
    addItem,
    removeItem,
    checkout
  }
})
