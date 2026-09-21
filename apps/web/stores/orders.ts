import { defineStore } from 'pinia'
import type { Order } from '~/types/api'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const loading = ref(false)
  const error = ref('')

  async function fetchOrders() {
    loading.value = true
    error.value = ''

    try {
      const api = useApi()
      orders.value = await api.request<Order[]>('/orders', { auth: true })
    } catch (unknownError) {
      error.value =
        unknownError instanceof Error
          ? unknownError.message
          : 'No se pudieron cargar las órdenes'
    } finally {
      loading.value = false
    }
  }

  async function fetchOrder(id: string) {
    loading.value = true
    error.value = ''

    try {
      const api = useApi()
      currentOrder.value = await api.request<Order>(`/orders/${id}`, {
        auth: true
      })
    } catch (unknownError) {
      error.value =
        unknownError instanceof Error
          ? unknownError.message
          : 'No se pudo cargar la orden'
    } finally {
      loading.value = false
    }
  }

  return {
    orders,
    currentOrder,
    loading,
    error,
    fetchOrders,
    fetchOrder
  }
})
