<script setup>
import { useUserStore } from '~/stores/user';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const userStore = useUserStore();
const toast = useToast()


const logout = async () => {

  toast.add({title: 'Efetuando logout...'})

  const { data, error } =  await useFetch('https://backup-mazzini.internal.timbrasil.com.br/nuxt/v1/account/logout/',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userStore.user.access}`
    }
  })

  if(data.value){
    toast.add({title: 'Redirecionando...'});
    authStore.setAuthenticated(false)
    authStore.$reset()
    userStore.$reset()
    window.location.reload()
  }

  if(error.value){
    toast.add({title:`Error: ${error.value.data}`})
  }

}

const items = [
  [{
    label: userStore.user.name,
    slot: 'account',
  }], [{
    label: 'Configurações',
    icon: 'i-heroicons-cog-8-tooth'
  }], [{
    label: 'Logout',
    icon: 'i-heroicons-arrow-left-on-rectangle',
    action: logout
  }]
]
</script>

<template>
  <UDropdown :items="items" :ui="{ item: { disabled: 'cursor-text select-text' } }" :popper="{ placement: 'bottom-start' }">
    <UAvatar :alt="userStore.user.name" size="sm" />

    <template #account="{ item }">
      <div class="text-left">
        <p>Conectado com</p>
        <p class="truncate font-medium text-gray-900 dark:text-white">{{ item.label }}</p>
      </div>
    </template>

    <template #item="{ item }">
      <span class="truncate" @click="item.action">{{ item.label }}</span>
      <UIcon :name="item.icon" class="flex-shrink-0 h-4 w-4 text-gray-400 dark:text-gray-500 ms-auto" />
    </template>
  </UDropdown>
</template>
