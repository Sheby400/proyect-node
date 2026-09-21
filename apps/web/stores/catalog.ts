import { defineStore } from 'pinia'
import type {
  Category,
  CategoryPayload,
  Product,
  ProductPayload
} from '~/types/api'

export const useCatalogStore = defineStore('catalog', () => {
  const products = ref<Product[]>([])
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref('')

  async function fetchProducts(filters: {
    active?: boolean
    categoryId?: string
    limit?: number
  } = {}) {
    loading.value = true
    error.value = ''

    try {
      const api = useApi()
      products.value = await api.request<Product[]>('/products', {
        query: {
          active: filters.active,
          categoryId: filters.categoryId,
          limit: filters.limit ?? 20
        }
      })
    } catch (unknownError) {
      error.value =
        unknownError instanceof Error
          ? unknownError.message
          : 'No se pudieron cargar los productos'
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories() {
    const api = useApi()
    categories.value = await api.request<Category[]>('/categories')
  }

  async function createProduct(payload: ProductPayload) {
    const api = useApi()
    const product = await api.request<Product, ProductPayload>('/products', {
      method: 'POST',
      body: payload,
      auth: true
    })

    products.value = [product, ...products.value]
  }

  async function updateProduct(id: string, payload: Partial<ProductPayload>) {
    const api = useApi()
    const product = await api.request<Product, Partial<ProductPayload>>(
      `/products/${id}`,
      {
        method: 'PATCH',
        body: payload,
        auth: true
      }
    )

    products.value = products.value.map((current) =>
      current.id === id ? product : current
    )
  }

  async function deleteProduct(id: string) {
    const api = useApi()
    await api.request<void>(`/products/${id}`, {
      method: 'DELETE',
      auth: true
    })

    products.value = products.value.filter((product) => product.id !== id)
  }

  async function createCategory(payload: CategoryPayload) {
    const api = useApi()
    const category = await api.request<Category, CategoryPayload>(
      '/categories',
      {
        method: 'POST',
        body: payload,
        auth: true
      }
    )

    categories.value = [...categories.value, category]
  }

  async function updateCategory(id: string, payload: Partial<CategoryPayload>) {
    const api = useApi()
    const category = await api.request<Category, Partial<CategoryPayload>>(
      `/categories/${id}`,
      {
        method: 'PATCH',
        body: payload,
        auth: true
      }
    )

    categories.value = categories.value.map((current) =>
      current.id === id ? category : current
    )
  }

  async function deleteCategory(id: string) {
    const api = useApi()
    await api.request<void>(`/categories/${id}`, {
      method: 'DELETE',
      auth: true
    })

    categories.value = categories.value.filter((category) => category.id !== id)
  }

  return {
    products,
    categories,
    loading,
    error,
    fetchProducts,
    fetchCategories,
    createProduct,
    updateProduct,
    deleteProduct,
    createCategory,
    updateCategory,
    deleteCategory
  }
})
