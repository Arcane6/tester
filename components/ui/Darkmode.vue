<script setup>
const colorMode = useColorMode()

const isDark = computed({
  get () {
    return colorMode.value === 'dark'
  },
  set () {
    colorMode.preference = colorMode.value === 'dark' ? 'bg-slate-200' : 'dark'
  }
})
</script>

<template>
  <ClientOnly>
    <UButton
      :icon="isDark ? 'i-material-symbols-nights-stay-rounded bg-zinc-100' : 'i-material-symbols-wb-sunny bg-zinc-100'"
      color="bg-slate-950"
      variant="ghost"
      aria-label="Theme"
      @click="isDark = !isDark"
    />

    <template #fallback>
      <div class="w-8 h-8" />
    </template>
  </ClientOnly>
</template>
