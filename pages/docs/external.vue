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
const search = ref('');
const page = ref(1);
const pageCount = ref(50);
const change = ref(false);

// Computed properties
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
const pageFor = computed(() => pageFrom.value + (pageCount.value - 1));

// Dados assíncronos
const { data: items, pending, error, refresh } = await useAsyncData('items', () => {
  const apiFilters = { q: search.value, p: page.value, size: pageCount.value, classificacao: 'externo' };

  if (change.value) {
    apiFilters['categoria'] = change.value;
  }

  return $fetch(`${BASE_URL}docs/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userStore.user.access}`
    },
    query: apiFilters
  });
}, { default: () => [], watch: [page, search, pageCount, change] });

// Carrega as colunas da aplicação
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
</script>


<template>
    <UCard >
        <template #header>
            <div class="flex flex-wrap justify-between items-center gap-4">

                <div class="flex flex-wrap flex-grow items-center gap-4">
                    <UButton icon="i-heroicons-arrow-left" color="gray" to="/" style="text-decoration: none;" :ui="{ rounded: 'rounded-full' }"/>
                    <h5 class="text-gray-900 font-semibold text-2xl mb-2 dark:text-white">Documentos compartilhados</h5>    
                </div>
                
                <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Pesquisa..." />
                            
                <USelectMenu v-model="selectedColumns" :options="columns" multiple searchable>
                    <UButton icon="i-heroicons-view-columns " color="gray" size="sm" label="Selecionar Colunas" />
                </USelectMenu>

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
</template>


