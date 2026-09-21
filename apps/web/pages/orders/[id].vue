<template>
  <section class="space-y-6">
    <NuxtLink class="text-sm font-semibold text-blue-700 hover:text-blue-900" to="/orders">
      Volver a órdenes
    </NuxtLink>

    <p v-if="orders.error" class="rounded bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ orders.error }}
    </p>

    <article
      v-if="orders.currentOrder"
      class="rounded border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="font-semibold text-blue-700">
            {{ orders.currentOrder.status }}
          </p>
          <h1 class="mt-2 text-3xl font-bold text-slate-950">
            Orden {{ orders.currentOrder.id }}
          </h1>
        </div>
        <strong class="text-2xl text-slate-950">
          ${{ orders.currentOrder.total.toFixed(2) }}
        </strong>
      </div>

      <div class="mt-6 overflow-hidden rounded border border-slate-200">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-100 text-slate-700">
            <tr>
              <th class="px-4 py-3">Producto</th>
              <th class="px-4 py-3">Cantidad</th>
              <th class="px-4 py-3">Precio</th>
              <th class="px-4 py-3">Subtotal</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="item in orders.currentOrder.items" :key="item.productId">
              <td class="px-4 py-3">{{ item.name }}</td>
              <td class="px-4 py-3">{{ item.quantity }}</td>
              <td class="px-4 py-3">${{ item.unitPrice.toFixed(2) }}</td>
              <td class="px-4 py-3">${{ item.subtotal.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

const route = useRoute()
const orders = useOrdersStore()

onMounted(() => {
  orders.fetchOrder(String(route.params.id))
})
</script>
