<script setup>

useSeoMeta({title: 'Nexus'})
import { useUserStore } from '~/stores/user';

const items = [ 
  {label: 'Avalie-nos', to: '/performance/net_promoter_score/'},
  {label: 'Melhorias', to: '/performance/improvement/'},
]

const URL_BASE = 'https://backup-mazzini.internal.timbrasil.com.br/nuxt/v1/'
const isAdmin = useUserStore().user.isAdmin
const toast = useToast();
const info_data = ref('');
const status_provisao = ref(false);
const status_manutencao = ref(false);

const {data: attrs, status: status, error: error} = await useAsyncData('triggers', async () => {
  const [dataDisposto, statusProvisao, statusManutencao] = await Promise.all([
    $fetch(URL_BASE + 'data_info/4/'), 
    $fetch(URL_BASE + 'data_info/2/'), 
    $fetch(URL_BASE + 'data_info/3/')
  ])

  return { 
    data: dataDisposto.info_data, 
    status_provisao: statusProvisao.info_active, 
    status_manutencao: statusManutencao.info_active
  }
}) 

// Atualizando valores
info_data.value = attrs.value.data;
status_provisao.value = attrs.value.status_provisao;
status_manutencao.value = attrs.value.status_manutencao;

// Observando mudanças nos status
watch(status_provisao, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    updateStatus(URL_BASE + 'data_info/2/', status_provisao.value);
  }
}, { immediate: false });


watch(status_manutencao, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    updateStatus(URL_BASE + 'data_info/3/', status_manutencao.value);
  }
}, { immediate: false });




// Função para atualizar status
async function updateStatus(endpoint, status) {
  
  const { data: response, error: error } = await useFetch(endpoint, {

    body: ref({ info_active: status })
  });

  if (error.value) {
    console.log(error.value.data);
  } 

  if (response.data) {
    toast.add({ 
      icon: "i-heroicons-check-badge", 
      title: 'Mundança feita com sucesso.' 
    });
  }
}

</script>
  

<template>
  <div>
    <header> 
      <nav class="border-gray-200 bg-gray-900">
        <div class="max-w-screen-2xl flex flex-wrap items-center justify-between mx-auto p-4">


          <!-- Link principal -->
          <NuxtLink to="/" v-once>
            <img class="w-36 h-12" src="/nexus_logo_white.png" />
          </NuxtLink>
          
          <span class="flex items-center space-x-4 rtl:space-x-reverse">
            <a href="/" class="self-center text-2xl font-semibold whitespace-nowrap text-white">
              <UIcon name="i-material-symbols-home-rounded"/>
            </a>
            <UiDarkmode/>
          </span>

          <!-- Botão de usuário -->
          <div class="flex items-center md:order-2 space-x-3 md:space-x-3 rtl:space-x-reverse">
              <button type="button" class="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300 ">
                <UiUserButton />
              </button>

              <div v-if="isAdmin">
                <UPopover>
                  <UButton color="gray" label="Ações" trailing-icon="i-heroicons-chevron-down-20-solid" />
                  <template #panel>
                    <div class="p-5">
                        <UCheckbox v-model="status_provisao" label="Provisão" color="rose"/>
                        <UCheckbox v-model="status_manutencao" label="Manutenção" color="rose" />
                    </div>
                  </template>
                </UPopover>
              </div>

          </div>

          <!-- Links rapidos -->
          <div class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1">
            <ul class="flex flex-col font-medium p-4 md:p-0 mt-4 border rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 bg-gray-800 md:bg-gray-900 border-gray-700">

              <div v-for="(item, key) in items" :key="key">
                <li>
                  <a :href="item.to" class="block py-2 px-3 rounded hover:bg-gray-100   md:p-0 text-white md:hover:text-blue-500  hover:text-white md:hover:bg-transparent border-gray-700">{{ item.label }}</a>
                </li>
              </div> 

              <li>
                <UButton size="xs" color="gray" :ui="{ rounded: 'rounded-full' }"> Disposto atualizado em {{ $date(info_data) }} </UButton>
              </li>

              
              <div>
                <li v-if="status_provisao">
                  <UButton size="xs" color="orange" label="Estamos em período de provisão, portanto os valores podem estar defasados."/>
                </li>
              </div>
              
              
            </ul>
          </div>
        </div>
      </nav>
    </header>

      <main class="min-h-[calc(100vh-var(--header-height))] ">
        <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-8xl">
          <div class="lg:grid lg:grid-cols-8 lg:gap-8">
            <div class="lg:col-span-8">
              <div class="mt-8 pb-24 prose prose-primary max-w-none">
                <slot />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
</template>







  
  
  
  
  