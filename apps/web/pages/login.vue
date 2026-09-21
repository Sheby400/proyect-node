<template>
  <section class="mx-auto max-w-md">
    <h1 class="text-3xl font-bold text-slate-950">
      Iniciar sesión
    </h1>
    <p class="mt-2 text-slate-600">
      Accede para comprar y consultar tus órdenes.
    </p>

    <form class="mt-6 space-y-4 rounded border border-slate-200 bg-white p-6" @submit.prevent="submit">
      <label class="block">
        <span class="text-sm font-medium text-slate-700">Correo</span>
        <input
          v-model="form.email"
          class="focus-ring mt-1 w-full rounded border border-slate-300 px-3 py-2"
          required
          type="email"
        >
      </label>

      <label class="block">
        <span class="text-sm font-medium text-slate-700">Contraseña</span>
        <input
          v-model="form.password"
          class="focus-ring mt-1 w-full rounded border border-slate-300 px-3 py-2"
          minlength="8"
          required
          type="password"
        >
      </label>

      <p v-if="auth.error" class="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
        {{ auth.error }}
      </p>

      <button
        class="focus-ring w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
        :disabled="auth.loading"
        type="submit"
      >
        {{ auth.loading ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const form = reactive({
  email: '',
  password: ''
})

async function submit() {
  await auth.login(form)
  await navigateTo('/')
}
</script>
