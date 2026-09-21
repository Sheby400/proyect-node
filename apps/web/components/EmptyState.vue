<template>
  <section class="rounded border border-dashed border-slate-300 bg-white p-8 text-center">
    <h2 class="text-lg font-semibold text-slate-950">
      {{ title }}
    </h2>
    <p class="mt-2 text-sm text-slate-600">
      {{ message }}
    </p>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  message: string
}>()
</script>
