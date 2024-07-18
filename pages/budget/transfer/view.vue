<script setup>
const userStore = useUserStore();
const BASE_URL = 'https://backup-mazzini.internal.timbrasil.com.br/nuxt/v1/';
const search = ref('')
const page = ref(1)
const pageCount = ref(50)
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
const pageFor = computed(() => pageFrom.value + (pageCount.value - 1))
const status = ref(true)


const { data: items } = await useAsyncData('items', () => 
    $fetch(BASE_URL+'transferencia/', {
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
    {
        default: () => [], 
        watch: [page, search, pageCount]
    })

    if(items.value){
        status.value = false
    }
        


const columns = [
  {key: 'area_layer', label: 'Área Layer'}, 
  {key: 'tipo', label: 'Tipo'},
  {key: 'detail_saida', label: 'Linha de Saída'},
  {key: 'valor_saida', label: 'Valor de Saída'},
  {key: 'detail_entrada', label: 'Linha de Entrada'},
  {key: 'valor_entrada', label: 'Valor de Entrada'},
  {key: 'solicitante', label: 'Solicitante'},
  {key: 'data_criacao', label: 'Data de Criação'},
]

const selectedColumns = ref(columns)
const columnsTable = computed(() => columns.filter((column) => selectedColumns.value.includes(column)))

</script>

<template>
    <div class="w-full flex flex-col gap-y-4">
        <UCard>
            <template #header>
                <div class="flex flex-wrap justify-between items-center gap-4">

                    <div class="flex flex-wrap flex-grow items-center gap-4">
                        <UButton icon="i-heroicons-arrow-left" color="gray" to="/budget/" style="text-decoration: none;" :ui="{ rounded: 'rounded-full' }"/>
                        <span class="text-gray-900 font-semibold text-2xl mb-2 dark:text-white">Transferências realizadas entre linhas</span>    
                    </div>

                    <ToolsExportData :to="`https://backup-mazzini.internal.timbrasil.com.br/admin/orcamento/documentos/transferencia/`" @click="toast.add({ icon:'i-heroicons-check-badge', color: 'orange', title: 'Processando solicitação, não mude de página' })"/>

                    <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Pesquisa..." />

                    <UPagination size="xs" v-model="page" :page-count="pageCount" :total="items.count" :active-button="{ variant: 'solid' }" :inactive-button="{ color: 'gray' }" :ui="{default: { activeButton: { variant: 'outline' } } }"/>
                
                </div>
            </template>

                <UTable
                    style="max-height: 60vh; overflow-y: auto; overflow-x: auto;"
                    :rows="items.results"
                    :columns="columnsTable"
                    :loading="status"
                    sort-asc-icon="i-heroicons-arrow-up"
                    sort-desc-icon="i-heroicons-arrow-down"
                    :ui="{
                        thead: 'text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400',
                        td: { size: 'text-xs', padding:'px-3 py-1', base: 'max-w-[0.5] truncate'},
                        th: { size: 'text-xs', padding:'px-3 py-1', base: 'max-w-[0.5] truncate'},
                        checkbox: {padding: 'ps-4'}, base: 'table-auto truncate'}">

                    <template v-for="float_fields in ['valor_saida','valor_entrada']" :key="float_fields" v-slot:[`${float_fields}-data`]="{ row }">
                        <div class="text-right">{{  $currency(row[float_fields]) }}</div>
                    </template>

                </UTable>

            <template #footer>
                <span class="text-sm leading-5 font-medium">
                    <p>Apresentando {{ items.count }} resultados de {{ pageFrom }} a {{ pageFor }}</p>
                </span>
            </template>

        </UCard>
    </div>

</template>