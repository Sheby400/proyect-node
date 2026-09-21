<template>
  <section class="space-y-6">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p class="font-semibold text-blue-700">
          Catálogo
        </p>
        <h1 class="mt-2 text-3xl font-bold text-slate-950">
          Productos disponibles
        </h1>
        <p class="mt-2 max-w-2xl text-slate-600">
          Frontend conectado al backend modular de productos, categorías, carrito y órdenes.
        </p>
      </div>

      <select
        v-model="selectedCategory"
        class="focus-ring rounded border border-slate-300 bg-white px-3 py-2"
        aria-label="Filtrar por categoría"
        @change="loadProducts"
      >
        <option value="">
          Todas las categorías
        </option>
        <option
          v-for="category in catalog.categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }}
        </option>
      </select>
    </div>

    <p
      v-if="!auth.isAuthenticated"
      class="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
    >
      Inicia sesión para agregar productos al carrito.
    </p>

    <p
      v-if="catalog.error"
      class="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ catalog.error }}
    </p>

    <div v-if="catalog.loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="item in 6"
        :key="item"
        class="h-56 animate-pulse rounded border border-slate-200 bg-white"
      />
    </div>

    <EmptyState
      v-else-if="catalog.products.length === 0"
      title="No hay productos"
      message="Crea productos desde el panel administrativo o revisa el backend."
    />

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <ProductCard
        v-for="product in catalog.products"
        :key="product.id"
        :product="product"
        :authenticated="auth.isAuthenticated"
        @add="addToCart"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const cart = useCartStore()
const catalog = useCatalogStore()
const selectedCategory = ref('')

async function loadProducts() {
  await catalog.fetchProducts({
    active: true,
    categoryId: selectedCategory.value || undefined,
    limit: 50
  })
}

async function addToCart(productId: string) {
  if (!auth.isAuthenticated) {
    await navigateTo('/login')
    return
  }

  await cart.addItem(productId, 1)
}

onMounted(async () => {
  auth.restoreSession()
  await Promise.all([
    catalog.fetchCategories(),
    loadProducts()
  ])

  if (auth.isAuthenticated) {
    await cart.fetchCart()
  }
})
</script>
