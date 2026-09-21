<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="font-semibold text-blue-700">
          Administración
        </p>
        <h1 class="mt-2 text-3xl font-bold text-slate-950">
          Categorías
        </h1>
      </div>

      <NuxtLink class="rounded border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-100" to="/admin/products">
        Productos
      </NuxtLink>
    </div>

    <form class="grid gap-4 rounded border border-slate-200 bg-white p-5 md:grid-cols-[1fr_1fr_auto]" @submit.prevent="saveCategory">
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
        <span class="text-sm font-medium text-slate-700">Slug</span>
        <input
          v-model="form.slug"
          class="focus-ring mt-1 w-full rounded border border-slate-300 px-3 py-2"
          pattern="[a-z0-9-]+"
          required
          type="text"
        >
      </label>

      <label class="flex items-end gap-2 pb-2">
        <input v-model="form.active" class="size-4" type="checkbox">
        <span class="text-sm font-medium text-slate-700">Activa</span>
      </label>

      <div class="flex gap-2 md:col-span-3">
        <button
          class="focus-ring rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          type="submit"
        >
          {{ editingId ? 'Actualizar categoría' : 'Crear categoría' }}
        </button>
        <button
          v-if="editingId"
          class="focus-ring rounded border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-100"
          type="button"
          @click="resetForm"
        >
          Cancelar
        </button>
      </div>
    </form>

    <p v-if="message" class="rounded bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {{ message }}
    </p>

    <div class="overflow-hidden rounded border border-slate-200 bg-white">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-100 text-slate-700">
          <tr>
            <th class="px-4 py-3">Nombre</th>
            <th class="px-4 py-3">Slug</th>
            <th class="px-4 py-3">Estado</th>
            <th class="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="category in catalog.categories" :key="category.id">
            <td class="px-4 py-3 font-semibold text-slate-950">{{ category.name }}</td>
            <td class="px-4 py-3">{{ category.slug }}</td>
            <td class="px-4 py-3">{{ category.active ? 'Activa' : 'Inactiva' }}</td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-2">
                <button
                  class="focus-ring rounded border border-slate-300 px-3 py-1.5 font-medium hover:bg-slate-100"
                  type="button"
                  @click="editCategory(category)"
                >
                  Editar
                </button>
                <button
                  class="focus-ring rounded border border-red-200 px-3 py-1.5 font-medium text-red-700 hover:bg-red-50"
                  type="button"
                  @click="removeCategory(category.id)"
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
import type { Category } from '~/types/api'

definePageMeta({
  middleware: ['admin']
})

const catalog = useCatalogStore()
const editingId = ref('')
const message = ref('')
const form = reactive({
  name: '',
  slug: '',
  active: true
})

function resetForm() {
  editingId.value = ''
  form.name = ''
  form.slug = ''
  form.active = true
}

function editCategory(category: Category) {
  editingId.value = category.id
  form.name = category.name
  form.slug = category.slug
  form.active = category.active
}

async function saveCategory() {
  message.value = ''

  if (editingId.value) {
    await catalog.updateCategory(editingId.value, { ...form })
    message.value = 'Categoría actualizada correctamente.'
    resetForm()
    return
  }

  await catalog.createCategory({ ...form })
  message.value = 'Categoría creada correctamente.'
  resetForm()
}

async function removeCategory(id: string) {
  await catalog.deleteCategory(id)
  message.value = 'Categoría eliminada correctamente.'
}

onMounted(() => {
  catalog.fetchCategories()
})
</script>
