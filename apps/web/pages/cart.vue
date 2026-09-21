<template>
  <section class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-slate-950">
        Carrito
      </h1>
      <p class="mt-2 text-slate-600">
        Revisa cantidades, elimina productos y confirma la orden.
      </p>
    </div>

    <p v-if="cart.error" class="rounded bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ cart.error }}
    </p>

    <EmptyState
      v-if="!cart.loading && cart.cart.items.length === 0"
      title="Tu carrito está vacío"
      message="Regresa al catálogo y agrega productos disponibles."
    />

    <div v-else class="overflow-hidden rounded border border-slate-200 bg-white">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-100 text-slate-700">
          <tr>
            <th class="px-4 py-3">Producto</th>
            <th class="px-4 py-3">Cantidad</th>
            <th class="px-4 py-3">Subtotal</th>
            <th class="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="item in cart.cart.items" :key="item.productId">
            <td class="px-4 py-3">
              <strong class="block text-slate-950">{{ item.name }}</strong>
              <span class="text-xs text-slate-500">{{ item.sku }}</span>
            </td>
            <td class="px-4 py-3">{{ item.quantity }}</td>
            <td class="px-4 py-3">${{ item.subtotal.toFixed(2) }}</td>
            <td class="px-4 py-3">
              <button
                class="focus-ring rounded border border-slate-300 px-3 py-1.5 font-medium hover:bg-slate-100"
                type="button"
                @click="cart.removeItem(item.productId)"
              >
                Quitar
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex flex-col items-end gap-3 border-t border-slate-200 p-4">
        <p class="text-xl font-bold text-slate-950">
          Total: ${{ cart.cart.total.toFixed(2) }}
        </p>
        <button
          class="focus-ring rounded bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
          type="button"
          @click="checkout"
        >
          Confirmar orden
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

const cart = useCartStore()

async function checkout() {
  const order = await cart.checkout()
  await navigateTo(`/orders/${order.id}`)
}

onMounted(() => {
  cart.fetchCart()
})
</script>
