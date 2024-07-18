<script setup>
import { filters } from '/utils/filters.js'
import { useUserStore } from '~/stores/user';

const { $currency } = useNuxtApp();
const userStore = useUserStore()
const toast = useToast()
const search = ref('')
const page = ref(1)
const pageCount = ref(1000)
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
const pageFor = computed(() => pageFrom.value + (pageCount.value - 1))
const loading = ref(false)
const loading_filters = ref(false)
const BASE_URL = 'https://backup-mazzini.internal.timbrasil.com.br/nuxt/v1/';




const { data: cols, error: err } = await useFetch(BASE_URL + 'cols/', {
  headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.user.access}`
  },
  query:{ 
    size: '1000', 
    model_view : 'base_orcamentaria' 
  }
})


const columns = cols.value.results
const defaultColumns = columns.slice(0, 10);
const selectedColumns = ref(defaultColumns)
const columnsTable = computed(() => columns.filter((column) => selectedColumns.value.includes(column)))

// Carrega os dados da base Orçamentária
const { data: items, pending, error, refresh } = await useAsyncData('base', () => {
  let apiFilters = { q: search.value, page: page.value, size: pageCount.value };

  filters.forEach(filter => {
    if (filter.model.value !== '') apiFilters[filter.apiParam] = filter.model.value;
  });

  return $fetch(`${BASE_URL}base_orcamentaria/`, {
    headers: {'Authorization': `Bearer ${userStore.user.access}`},
    query: apiFilters
  });
}, 
{ 
  default: () => [], 
  watch: [page, search, pageCount, ...filters.map(filter => filter.model)]
});

  
const sumField = (field) => computed(() => {
  return $currency(items.value?.results?.reduce((total, item) => total + item[field], 0))
});

const valor_transf_bgt = sumField('valor_transf_bgt')
const necessidade = sumField('necessidade')
const desafio = sumField('desafio')
const waiting_list = sumField('waiting_list')
const valor_transf_antecipo = sumField('valor_transf_antecipo')
const valor_em_disposto = sumField('valor_em_disposto')

// Função para limpar filtros
function clear(){
  filters.forEach(filter => filter.model.value = '');
}

// Função para atualizar consumo
async function atualizarDisposto(){
  toast.add({ icon:'i-heroicons-check-badge', color: 'orange', title: 'Processando sua solicitação. Por favor, aguarde, esse processo pode demorar' })
  loading.value = true
  const { response, error } = await useFetch(BASE_URL+'disposto/gerar/', {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.user.access}`
    },
  })

  loading.value = false

  if(error.value){
    toast.add({ 
      icon:'i-heroicons-check-badge', 
      color: 'red', 
      title: 'Ocorreu um erro no processo' 
    })
  } 

  if(response.value) {
    toast.add({ 
      icon:'i-heroicons-check-badge', 
      color: 'green', 
      title: 'Atualizado com sucesso!' 
    })
  }
}
</script>



<template>
  <!-- Cartão principal que engloba toda a estrutura -->
  <UCard class="w-full" 
    :ui="{ 
      divide: 'divide-y divide-gray-200 dark:divide-gray-700', 
      header: { padding: 'px-4 py-5' }, 
      body: { padding: '', base: 'divide-y divide-gray-200 dark:divide-gray-700' } 
    }">

    <!-- Cabeçalho com controles e filtros -->
    <div class="flex flex-wrap flex-grow items-center justify-between gap-3 px-4 py-2">      
      <div class="flex flex-wrap flex-grow justify-between items-center w-full px-4 py-2">     
        <div class="flex flex-wrap flex-grow items-center gap-1.5">
          
          <!-- Campo de busca -->
          <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" />

          <!-- Seleção de quantidade de itens por página -->
          <USelect v-model="pageCount" :options="[10, 20, 30, 40, 50, 100, 200, {value: items.count, label: 'Todas'} ]" class="me-2 w-20" size="xs"/>

          <!-- Botão para exportação de dados -->
          <ToolsExportData to="https://mazzini.internal.timbrasil.com.br/admin/orcamento/documentos/cenario/" @click="toast.add({ icon:'i-heroicons-check-badge', color: 'orange', title: 'Processando solicitação, não mude de página' })"/>

          <!-- Botão para visão gráfica -->
          <UButton icon="i-ri-pie-chart-2-fill" color="gray" style="text-decoration: none;" to="/budget/chart" label="Visão Gráfica" />

          <!-- Menu de seleção de colunas -->
          <USelectMenu v-model="selectedColumns" :options="columns" multiple searchable>
            <UButton icon="i-heroicons-view-columns " color="gray" size="sm" label="Selecionar Colunas" />
          </USelectMenu>

          <!-- Botão para visão de transferências -->
          <UButton label="Visão de transferências" color="gray" size="sm" to="/budget/transfer/view" style="text-decoration: none;" />

          <!-- Condicional para botões adicionais baseados em grupos de usuários -->
          <div v-if="userStore.user.isAdmin" class="flex flex-wrap flex-grow items-center gap-1.5">
            
            <!-- Botão para adicionar linha -->
            <UButton color="blue" size="sm" style="text-decoration: none;" to="/budget/form" label="Adicionar Linha" />

            <!-- Popover para movimentações -->
            <UPopover>
              <UButton color="blue" label="Movimentações"  />
              <template #panel>
                <div class="p-2 grid gap-1.5">
                  <UButton icon="i-material-symbols-compare-arrows " color="blue" size="sm" style="text-decoration: none;" to="/budget/transfer" label="Transferências" />
                  <UButton icon="i-material-symbols-compare-arrows " color="blue" size="sm" style="text-decoration: none;" to="/budget/mov" label="Corte/Incremento" />
                </div>              
              </template>
            </UPopover>

            <!-- Botão para atualizar consumo -->
            <UButton color="blue" size="sm" :loading="loading" :disabled="loading" label="Atualizar consumo" @click="atualizarDisposto" />  
          </div>
        </div>

        <!-- Paginação -->
        <UPagination size="xs" v-model="page" :page-count="pageCount" :total="items.count" :active-button="{ variant: 'solid', color: 'blue' }" :inactive-button="{ color: 'gray' }" :ui="{ default: { activeButton: { variant: 'outline' } } }"/>
      </div>
    </div>

    <!-- Filtros -->
    <div v-once class="flex flex-wrap justify-between items-center gap-3 px-4 py-3">
      <div class="flex-grow flex gap-4">
        <UPopover :popper="{ arrow: true }">
          <UButton class="w-30 gap-3 ml-4" label="Filtros" color="gray" trailing-icon="i-heroicons-chevron-down-20-solid" />
          <template #panel>
            <UCard>
              <div class="grid grid-cols-1 gap-4">
                <div v-for="(filter, index) in filters" :key="index" class="w-60">       
                  <USelectMenu v-model="filter.model.value" :loading="loading_filters" :options="filter.options" :placeholder="filter.placeholder" />
                </div>
              </div>
            </UCard>
          </template>
        </UPopover>
        <UButton color="gray" size="sm" style="text-decoration: none;" @click="clear" label="Limpar" />
        <UButton color="gray" size="sm" label="Atualizar" @click="refresh()" />
      </div>
    </div>

    <!-- Tabela de dados -->
    <UTable
      style="max-height: 60vh; overflow-y: auto; overflow-x: auto;"
      :rows="items.results"
      :columns="columnsTable"
      :loading="pending"
      :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'carregando...' }"
      :progress="{ color: 'primary', animation: 'carousel' }"
      sort-asc-icon="i-heroicons-arrow-up"
      sort-desc-icon="i-heroicons-arrow-down"
      :ui="{
        thead: 'text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400',
        td: { size: 'text-xs', padding:'px-3 py-1', base: 'max-w-[0.5] truncate'},
        th: { size: 'text-xs', padding:'px-3 py-1', base: 'max-w-[0.5] truncate'},
        checkbox: {padding: 'ps-4'}, base: 'table-auto truncate'
      }">
      
          <!-- Template para links -->
          <template #element_detail-data="{ row }">
            <div style="max-width: 350px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              <NuxtLink class="dark:text-white" style="text-decoration: none;" :to="`/budget/${row.id}`">{{ row.element_detail }}</NuxtLink>
            </div>
          </template>

          <!-- Template para detalhes -->
          <template #detail-data="{ row }">
            <div style="max-width: 500px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ row.detail || null }}</div>
          </template>

          <template #valor_transf_bgt-header="{ column, onSort, sort }">
            <UButton trailing :icon="sort.direction === 'asc' ? 'i-heroicons-arrow-up' : 'i-heroicons-arrow-down'" @click="onSort(column)" size="2xs" variant="ghost" color="black"> 
              <div class="flex flex-col text-right" >
                <span class="text-sm text-right">{{ valor_transf_bgt }}</span>
                <span class="text-right">VALOR OPERATIVO</span>
              </div>
            </UButton>
          </template>

          <template #necessidade-header="{ column, onSort, sort }">
            <UButton trailing :icon="sort.direction === 'asc' ? 'i-heroicons-arrow-up' : 'i-heroicons-arrow-down'" @click="onSort(column)" size="2xs" variant="ghost" color="black"> 
              <div class="flex flex-col text-right">
                <span class="text-sm">{{ necessidade }}</span>
                NECESSIDADE
              </div>
            </UButton>
          </template>

          <template #desafio-header="{ column, onSort, sort }">
            <UButton trailing :icon="sort.direction === 'asc' ? 'i-heroicons-arrow-up' : 'i-heroicons-arrow-down'" @click="onSort(column)" size="2xs" variant="ghost" color="black"> 
              <div class="flex flex-col text-right">
                <span class="text-sm text-bold">{{ desafio }}</span>
                DESAFIO
              </div>
            </UButton>
          </template>

          <template #waiting_list-header="{ column, onSort, sort }">
            <UButton trailing :icon="sort.direction === 'asc' ? 'i-heroicons-arrow-up' : 'i-heroicons-arrow-down'" @click="onSort(column)" size="2xs" variant="ghost" color="black"> 
              <div class="flex flex-col text-right">
                <span class="text-sm">{{ waiting_list }}</span>
                WAITING LIST
              </div>
            </UButton>
          </template>

          <template #valor_transf_antecipo-header="{ column, onSort, sort }">
            <UButton trailing :icon="sort.direction === 'asc' ? 'i-heroicons-arrow-up' : 'i-heroicons-arrow-down'" @click="onSort(column)" size="2xs" variant="ghost" color="black"> 
              <div class="flex flex-col text-right">
                <span class="text-sm">{{ valor_transf_antecipo }}</span>
                ANTECIPO
              </div>
            </UButton>
          </template>

          <template #valor_em_disposto-header="{ column, onSort, sort }">
            <UButton trailing :icon="sort.direction === 'asc' ? 'i-heroicons-arrow-up' : 'i-heroicons-arrow-down'" @click="onSort(column)" size="2xs" variant="ghost" color="black"> 
              <div class="flex flex-col text-right">
                <span class="text-sm">{{ valor_em_disposto }}</span>
                DISPOSTO
              </div>
            </UButton>
          </template>

          <!-- Template para dados numéricos -->
          <template v-for="float_fields in ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro', 'total_pxq', 'total_lbo', 'necessidade', 'quantidade', 'valor_transf_bgt', 'valor_transf_antecipo', 'valor_em_disposto', 'valor_replanejado_janeiro', 'valor_replanejado_fevereiro', 'valor_replanejado_marco', 'valor_replanejado_abril', 'valor_replanejado_maio', 'valor_replanejado_junho', 'valor_replanejado_julho', 'valor_replanejado_agosto', 'valor_replanejado_setembro', 'valor_replanejado_outubro', 'valor_replanejado_novembro', 'valor_replanejado_dezembro', 'desafio', 'waiting_list', 'old_2025', 'old_2026', 'operativo_2025', 'operativo_2026', 'need_escopo_negocial', 'need_of_which_ipca', 'anticipo', 'valor_total', 'anticipo']" :key="float_fields" v-slot:[`${float_fields}-data`]="{ row }">
            <div class="text-right">{{ $currency(row[float_fields]) }}</div>
          </template>
    </UTable>

    <!-- Rodapé com informações de paginação -->
    <template #footer>
      <div class="flex flex-wrap justify-between items-center">
        <span class="text-sm leading-5 font-medium">
          Apresentando {{ items.count }} resultados de {{ pageFrom }} a {{ pageFor }} 
        </span>
      </div>
    </template>
  </UCard>
</template>

