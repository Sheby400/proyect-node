<template>
  <article class="flex h-full flex-col rounded border border-slate-200 bg-white p-5 shadow-sm">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-blue-700">
          {{ product.sku }}
        </p>
        <h2 class="mt-1 text-lg font-bold text-slate-950">
          {{ product.name }}
        </h2>
      </div>
      <span
        class="rounded-full px-2.5 py-1 text-xs font-semibold"
        :class="product.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'"
      >
        {{ product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock' }}
      </span>
    </div>

    <p class="mt-3 flex-1 text-sm leading-6 text-slate-600">
      {{ product.description || 'Producto sin descripción.' }}
    </p>

    <div class="mt-5 flex items-center justify-between gap-3">
      <strong class="text-xl text-slate-950">
        ${{ product.price.toFixed(2) }}
      </strong>
      <button
        class="focus-ring rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        type="button"
        :disabled="!canAdd"
        @click="$emit('add', product.id)"
      >
        Agregar
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Product } from '~/types/api'

const props = defineProps<{
  product: Product
  authenticated: boolean
}>()

defineEmits<{
  add: [productId: string]
}>()

const canAdd = computed(
  () => props.authenticated && props.product.active && props.product.stock > 0
)
</script>
