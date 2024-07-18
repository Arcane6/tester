<script setup>
import { useUserStore } from '~/stores/user';

// Constantes
const BASE_URL = "https://backup-mazzini.internal.timbrasil.com.br/nuxt/v1/";
const ICONS = {
    'EXCEL': 'i-vscode-icons-file-type-excel',
    'PPT': 'i-vscode-icons-file-type-powerpoint',
    'PDF': 'i-vscode-icons-file-type-pdf2',
    'TXT': 'i-vscode-icons-file-type-text',
    'DOC': 'i-vscode-icons-file-type-word',
    'EMAIL': 'i-material-symbols-stacked-email-outline',
    'OUTROS': 'i-material-symbols-unknown-document-rounded'
};

// Referências e estados
const userStore = useUserStore();
const toast = useToast();
const loading = ref(false);
const search = ref('');
const page = ref(1);
const pageCount = ref(50);
const fileInput = ref(null);
const payload = ref({ nome: '', categoria: '', disponibilizado_por: '', classificacao: '', descritivo: '' });

// Computed properties
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
const pageFor = computed(() => pageFrom.value + (pageCount.value - 1));

// Dados assíncronos
const { data: items, pending } = await useAsyncData('items', () => 
  $fetch(`${BASE_URL}docs/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userStore.user.access}`
    },
    query: { 
      q: search.value, 
      page: page.value, 
      size: pageCount.value 
    }
  }), 
  { default: () => [], watch: [page, search, pageCount] }
);

const { data: cols } = await useFetch(`${BASE_URL}cols/?model_view=documentos`, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userStore.user.access}`
  }
});

const columns = cols.value.results;
const selectedColumns = ref(columns);
const columnsTable = computed(() => columns.filter(column => selectedColumns.value.includes(column)));

// Funções
function getIcon(categoria) {
  return ICONS[categoria] || '';
}

async function submitForm() {
  loading.value = true;
  const formData = new FormData();
  formData.append('nome', payload.value.nome);
  formData.append('categoria', payload.value.categoria);
  formData.append('classificacao', payload.value.classificacao);
  formData.append('arquivo', fileInput.value);
  formData.append('descritivo', payload.value.descritivo);
  formData.append('disponibilizado_por', payload.value.disponibilizado_por);

  const { data: response, error } = await useFetch(`${BASE_URL}docs/`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${userStore.user.access}`
    }
  });

  loading.value = false;

  if (error.value) {
    console.error(error.value.data);
    toast.add({ 
        icon: "i-heroicons-exclamation-triangle", 
        color: "red", 
        title: `Erro na requisição - ${error.value.statusCode}`, 
        description: error.value.data 
    });

  } else {
    toast.add({ 
        icon: "i-heroicons-check-badge", 
        title: 'Dados Enviados com sucesso!' 
    });

    window.location.reload();
  }
}

function handleFileUpload(event) {
  if (event?.target?.type === 'file' && event.target.files?.length > 0) {
    fileInput.value = event.target.files[0];
  } else {
    console.log('O evento ou o target estão undefined ou não é um input do tipo file');
  }
}

onMounted(() => {
  fileInput.value.$el.addEventListener('change', handleFileUpload);
});
</script>



<template>
<div>
    <div class="w-full flex flex-col gap-y-4">  
        <div class="grid grid-cols-12 gap-4">
            <UCard class="col-span-4">
              <template #header>
                <div class="flex flex-wrap flex-grow items-center gap-4">
                  <UButton icon="i-heroicons-arrow-left" color="gray" to="/" style="text-decoration: none;" :ui="{ rounded: 'rounded-full' }"/>
                  <h5 class="text-gray-900 font-semibold text-2xl mb-2 dark:text-white">Documentos</h5>   
                </div>
              </template>
                    <div class="grid grid-cols-1 gap-4 py-2.5">

                        <UFormGroup required label="Nome" name="nome" >
                            <UInput  required color="gray" v-model="payload.nome"/>
                        </UFormGroup>

                        <UFormGroup required label="Categoria do documento" name="categoria" >
                            <UInputMenu  required  color="gray" v-model="payload.categoria" :options="['EMAIL','PPT','TXT','PDF','DOC','EXCEL', 'OUTROS']"/>
                        </UFormGroup>
                        
                        <UFormGroup required label="Classificação do documento" name="classificacao" >
                            <USelectMenu  required  color="gray" v-model="payload.classificacao" :options="['interno','externo']"/>
                        </UFormGroup>

                        <UFormGroup required label="Documento" name="documento" >
                            <UInput required ref="fileInput" icon="i-heroicons-folder"  type="file" color="gray"/>
                        </UFormGroup>

                        <UFormGroup required label="Disponibilizado por" name="disponibilizado_por" >
                            <UInput  required color="gray" v-model="payload.disponibilizado_por" disabled/>
                        </UFormGroup>
                        
                        <UFormGroup required label="Descrição" name="descritivo" >
                            <UTextarea :maxrows="10"  color="gray" v-model="payload.descritivo" />
                        </UFormGroup>
                    </div>

                    <div>
                        <UButton class="flex w-full justify-center rounded-md px-3 text-sm font-semibold leading-6 mt-16" variant="solid" label="Enviar" color="gray" :loading="loading" @click="submitForm" />
                    </div>
            </UCard>
    
            <UCard class="col-span-8">
                <template #header>
                        <div class="flex flex-wrap justify-between items-center">
                            <div class="flex flex-wrap flex-grow items-center gap-1.5">

                                <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Pesquisa..." />
                                
                                <USelectMenu v-model="selectedColumns" :options="columns" multiple searchable>
                                    <UButton icon="i-heroicons-view-columns " color="gray" size="sm" label="Selecionar Colunas" />
                                </USelectMenu>

                            </div>
                            <UPagination size="xs" v-model="page" :page-count="pageCount" :total="items.count" :active-button="{ variant: 'solid' }" :inactive-button="{ color: 'gray' }" :ui="{default: {activeButton: { variant: 'outline'}}}"/>
                        </div>
                    </template>

                <UTable
                    style="max-height: 50vh; overflow-y: auto; overflow-x: auto;"
                    :rows="items.results"
                    :columns="columnsTable"
                    :loading="pending"
                    sort-asc-icon="i-heroicons-arrow-up"
                    sort-desc-icon="i-heroicons-arrow-down"
                    :ui="{
                        thead: 'text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400',
                        td: { size: 'text-xs', padding:'px-3 py-1', base: 'max-w-[0.5] truncate'},
                        th: { size: 'text-xs', padding:'px-3 py-1', base: 'max-w-[0.5] truncate'},
                        checkbox: {padding: 'ps-4'}, base: 'table-auto truncate'}">
            
                <template #categoria-data="{ row }">
                    <UButton size="xl"  variant="link" color="white" :ui="{ rounded: 'rounded-full' }" :icon="getIcon(row.categoria)" />
                </template>

                <template #arquivo-data="{ row }">
                    <UButton label="Download" color="gray" :to="row.arquivo" style="text-decoration: none;" />
                </template>


                </UTable>


                <template #footer>
                    <div class="flex flex-wrap justify-between items-center">
                        <span class="text-sm leading-5 font-medium">Apresentando {{ items.count }} resultados de {{ pageFrom }} a {{ pageFor }}</span>
                    </div>
                </template>
            </UCard>
        </div>
    </div>
</div>
</template>

