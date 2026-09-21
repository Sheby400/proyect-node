<template>
  <form class="grid gap-4 rounded border border-slate-200 bg-white p-5" @submit.prevent="submit">
    <div class="grid gap-4 md:grid-cols-2">
      <label class="block">
        <span class="text-sm font-medium text-slate-700">SKU</span>
        <input
          v-model="form.sku"
          class="focus-ring mt-1 w-full rounded border border-slate-300 px-3 py-2"
          required
          type="text"
        >
      </label>

      <label class="block">
        <span class="text-sm font-medium text-slate-700">Nombre</span>
        <input
          v-model="form.name"
          class="focus-ring mt-1 w-full rounded border border-slate-300 px-3 py-2"
          required
          type="text"
        >
      </label>

      <label class="block">
        <span class="text-sm font-medium text-slate-700">Precio</span>
        <input
          v-model.number="form.price"
          class="focus-ring mt-1 w-full rounded border border-slate-300 px-3 py-2"
          min="0"
          required
          step="0.01"
          type="number"
        >
      </label>

      <label class="block">
        <span class="text-sm font-medium text-slate-700">Stock</span>
        <input
          v-model.number="form.stock"
          class="focus-ring mt-1 w-full rounded border border-slate-300 px-3 py-2"
          min="0"
          required
          type="number"
        >
      </label>

      <label class="block">
        <span class="text-sm font-medium text-slate-700">Categoría</span>
        <select
          v-model="form.categoryId"
          class="focus-ring mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2"
        >
          <option value="">
            Sin categoría
          </option>
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
      </label>

      <label class="flex items-center gap-2 self-end">
        <input v-model="form.active" class="size-4" type="checkbox">
        <span class="text-sm font-medium text-slate-700">Producto activo</span>
      </label>
    </div>

    <label class="block">
      <span class="text-sm font-medium text-slate-700">Descripción</span>
      <textarea
        v-model="form.description"
        class="focus-ring mt-1 min-h-24 w-full rounded border border-slate-300 px-3 py-2"
      />
    </label>

    <div class="flex flex-wrap justify-end gap-2">
      <button
        v-if="editing"
        class="focus-ring rounded border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-100"
        type="button"
        @click="$emit('cancel')"
      >
        Cancelar
      </button>
      <button
        class="focus-ring rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        type="submit"
      >
        {{ editing ? 'Actualizar producto' : 'Crear producto' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { Category, Product, ProductPayload } from '~/types/api'

const props = defineProps<{
  categories: Category[]
  product?: Product | null
}>()

const emit = defineEmits<{
  cancel: []
  save: [payload: ProductPayload]
}>()

const editing = computed(() => Boolean(props.product))
const form = reactive<ProductPayload>({
  sku: '',
  name: '',
  description: '',
  price: 0,
  stock: 0,
  active: true,
  categoryId: ''
})

function fillForm() {
  form.sku = props.product?.sku ?? ''
  form.name = props.product?.name ?? ''
  form.description = props.product?.description ?? ''
  form.price = props.product?.price ?? 0
  form.stock = props.product?.stock ?? 0
  form.active = props.product?.active ?? true
  form.categoryId = props.product?.categoryId ?? ''
}

function submit() {
  emit('save', {
    ...form,
    categoryId: form.categoryId || undefined
  })

  if (!editing.value) {
    fillForm()
  }
}

watch(() => props.product, fillForm, { immediate: true })
</script>
