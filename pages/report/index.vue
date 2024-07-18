<template>
  <UContainer :ui="{ base: 'mx-auto',  padding: 'px-4 sm:px-6 lg:px-8',  constrained: 'max-w-8xl'}">
      <div class="text-center py-4">
          <h2 class="h-20 text-gray-900 font-semibold text-2xl mb-2 dark:text-white">Selecione o modelo de report desejado</h2>
      </div>
        
  <UCard  class="bg-white border-gray-200  dark:bg-gray-900">
    <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
      <div v-for="(card, index) in cards" :key="index">
        <div class="p-8 bg-local bg-gray-500 bg-center bg-no-repeat bg-cover rounded-lg bg-blend-multiply hover:bg-blend-soft-light dark:hover:bg-blend-light shadow-lg " :style="{ backgroundImage: 'url(' + card.img + ')'}">
          <NuxtLink :to="card.path" style="text-decoration: none;" >
            <p class="text-slate-50 text-xl font-medium font-sans">{{ card.title }}</p>
            <p class="text-slate-50">{{ card.footer }}</p>
          </NuxtLink>
            <UButton 
            label="Acessar" 
            :to="card.path" 
            :ui="{ rounded: 'rounded-lg' }" 
            icon="i-heroicons-arrow-right-20-solid" 
            trailing 
            variant="outline" 
            style="text-decoration: none;"
            class="border-2 text-white dark:text-white hover:opacity-90 hover:text-black"/>
        </div >
      </div>
    </div>
  </UCard>


</UContainer>
</template>

<script setup>
  
const cards = [
        { title: 'Área Layer', footer: 'Envio de relatórios por área layer', path: '/report/categories/area_layer',  img: "/report.png" },
        { title: 'Layer',  footer: 'Envio de relatórios por layer', path: '/report/categories/novo_layer', img: "/report.png" },
        { title: 'Tema',  footer: 'Envio de relatórios por tema', path: '/report/categories/tema',  img: "/report.png" }
      ]



</script>


