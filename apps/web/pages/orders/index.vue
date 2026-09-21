<template>
  <section class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-slate-950">
        Mis órdenes
      </h1>
      <p class="mt-2 text-slate-600">
        Historial de compras generado desde el backend.
      </p>
    </div>

    <p v-if="orders.error" class="rounded bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ orders.error }}
    </p>

    <EmptyState
      v-if="!orders.loading && orders.orders.length === 0"
      title="No hay órdenes"
      message="Cuando confirmes una compra aparecerá en este listado."
    />

    <div v-else class="grid gap-4">
      <NuxtLink
        v-for="order in orders.orders"
        :key="order.id"
        class="rounded border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300"
        :to="`/orders/${order.id}`"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="font-bold text-slate-950">
              Orden {{ order.id }}
            </h2>
            <p class="text-sm text-slate-500">
              {{ order.items.length }} productos
            </p>
          </div>
          <div class="text-right">
            <span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              {{ order.status }}
            </span>
            <p class="mt-2 font-bold text-slate-950">
              ${{ order.total.toFixed(2) }}
            </p>
          </div>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

const orders = useOrdersStore()

onMounted(() => {
  orders.fetchOrders()
})
</script>
