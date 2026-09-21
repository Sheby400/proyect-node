<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="font-semibold text-blue-700">
          Administración
        </p>
        <h1 class="mt-2 text-3xl font-bold text-slate-950">
          Productos
        </h1>
      </div>

      <NuxtLink class="rounded border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-100" to="/admin/categories">
        Categorías
      </NuxtLink>
    </div>

    <AdminProductForm
      :categories="catalog.categories"
      :product="editingProduct"
      @cancel="editingProduct = null"
      @save="saveProduct"
    />

    <p v-if="message" class="rounded bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {{ message }}
    </p>
    <p v-if="catalog.error" class="rounded bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ catalog.error }}
    </p>

    <div class="overflow-hidden rounded border border-slate-200 bg-white">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-100 text-slate-700">
          <tr>
            <th class="px-4 py-3">Producto</th>
            <th class="px-4 py-3">Precio</th>
            <th class="px-4 py-3">Stock</th>
            <th class="px-4 py-3">Estado</th>
            <th class="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="product in catalog.products" :key="product.id">
            <td class="px-4 py-3">
              <strong class="block text-slate-950">{{ product.name }}</strong>
              <span class="text-xs text-slate-500">{{ product.sku }}</span>
            </td>
            <td class="px-4 py-3">${{ product.price.toFixed(2) }}</td>
            <td class="px-4 py-3">{{ product.stock }}</td>
            <td class="px-4 py-3">
              {{ product.active ? 'Activo' : 'Inactivo' }}
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-2">
                <button
                  class="focus-ring rounded border border-slate-300 px-3 py-1.5 font-medium hover:bg-slate-100"
                  type="button"
                  @click="editingProduct = product"
                >
                  Editar
                </button>
                <button
                  class="focus-ring rounded border border-red-200 px-3 py-1.5 font-medium text-red-700 hover:bg-red-50"
                  type="button"
                  @click="removeProduct(product.id)"
                >
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Product, ProductPayload } from '~/types/api'

definePageMeta({
  middleware: ['admin']
})

const catalog = useCatalogStore()
const editingProduct = ref<Product | null>(null)
const message = ref('')

async function saveProduct(payload: ProductPayload) {
  message.value = ''

  if (editingProduct.value) {
    await catalog.updateProduct(editingProduct.value.id, payload)
    editingProduct.value = null
    message.value = 'Producto actualizado correctamente.'
    return
  }

  await catalog.createProduct(payload)
  message.value = 'Producto creado correctamente.'
}

async function removeProduct(id: string) {
  await catalog.deleteProduct(id)
  message.value = 'Producto eliminado correctamente.'
}

onMounted(async () => {
  await Promise.all([
    catalog.fetchCategories(),
    catalog.fetchProducts({ limit: 100 })
  ])
})
</script>
