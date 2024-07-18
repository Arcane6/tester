<template>
  <div class="flex flex-col items-center mt-28">
    <span class="text-3xl dark:text-white">Estamos melhorando algumas coisas ... </span>
    <img class="h-auto max-w-2xl" src="/maintenance.gif" alt="Descrição do GIF">
    <span class=" text-3xl">Volte mais tarde!</span>
  </div>
</template>

<script setup>
const colorMode = useColorMode()
colorMode.value = 'bg-white'
</script>