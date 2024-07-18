<template>
  <UContainer :ui="{ base: 'mx-auto',  padding: 'px-4 sm:px-6 lg:px-8',  constrained: 'max-w-8xl'}">      
        <div class='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          <div v-for="(card, index) in cards" :key="index" class="overflow-hidden max-w-sm w-full lg:max-w-full lg:flex shadow-lg bg-white border border-gray-200 rounded dark:bg-gray-800 dark:border-gray-700">
            <NuxtLink :to="card.path" style="text-decoration: none;">    
              <img class=" w-full -mt-4 transform transition-all duration-500 hover:scale-105" :src="card.img" alt=""  />
              <div class="px-6 py-4 ">
                <div class="text-gray-900 font-bold text-xl mb-2 dark:text-white">{{ card.title }}</div>
                <p class="text-gray-700  text-sm dark:text-white">{{ card.footer }}</p>
              </div>
            </NuxtLink>
          </div>
        </div>

  </UContainer>

</template>

<script setup>
import { useUserStore } from '~/stores/user';
const userStore = useUserStore();
const cards = ref([])


const { data: elements,  error: error } = await useFetch('https://backup-mazzini.internal.timbrasil.com.br/nuxt/v1/card2/', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userStore.user.access}`
  }
})

if (error.value){
  console.log(error.value.data)
}

if (elements.value){
  cards.value = elements.value
}



</script>