<template>
  <header class="border-b border-slate-200 bg-white">
    <nav
      class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
      aria-label="Navegación principal"
    >
      <NuxtLink to="/" class="flex items-center gap-2 font-bold text-slate-950">
        <span class="grid size-9 place-items-center rounded bg-blue-600 text-white">
          EC
        </span>
        <span>E-Commerce</span>
      </NuxtLink>

      <div class="flex flex-wrap items-center gap-2 text-sm">
        <NuxtLink class="rounded px-3 py-2 font-medium text-slate-700 hover:bg-slate-100" to="/">
          Catálogo
        </NuxtLink>

        <NuxtLink
          v-if="auth.isAuthenticated"
          class="rounded px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
          to="/cart"
        >
          Carrito
          <span
            v-if="cart.itemCount"
            class="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700"
          >
            {{ cart.itemCount }}
          </span>
        </NuxtLink>

        <NuxtLink
          v-if="auth.isAuthenticated"
          class="rounded px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
          to="/orders"
        >
          Órdenes
        </NuxtLink>

        <NuxtLink
          v-if="auth.isAdmin"
          class="rounded px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
          to="/admin/products"
        >
          Admin
        </NuxtLink>

        <template v-if="auth.isAuthenticated">
          <span class="hidden text-slate-500 sm:inline">
            {{ auth.user?.name }}
          </span>
          <button
            class="focus-ring rounded bg-slate-900 px-3 py-2 font-semibold text-white hover:bg-slate-700"
            type="button"
            @click="logout"
          >
            Salir
          </button>
        </template>

        <template v-else>
          <NuxtLink
            class="rounded px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
            to="/login"
          >
            Login
          </NuxtLink>
          <NuxtLink
            class="focus-ring rounded bg-blue-600 px-3 py-2 font-semibold text-white hover:bg-blue-700"
            to="/register"
          >
            Registro
          </NuxtLink>
        </template>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const cart = useCartStore()

function logout() {
  auth.logout()
  navigateTo('/login')
}
</script>
