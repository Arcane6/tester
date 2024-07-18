<script setup>
import { ref, computed, watch } from 'vue';
import { errorMessages } from 'vue/compiler-sfc';
import { useUserStore } from '~/stores/user';

const userStore = useUserStore();
const search = ref('');
const page = ref(1);
const pageCount = ref(100);
const loading = ref(false);
const detail = ref(false);
const BASE_URL = 'https://backup-mazzini.internal.timbrasil.com.br/nuxt/v1/';
const payload = ref({ tipo_movimentacao: '', opcao: '', codigo_op: '', valor: 0, justificativa: '', solicitante: userStore.user.name });

const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
const pageFor = computed(() => pageFrom.value + (pageCount.value - 1));

const { data: cols, error: colsError } = await fetchColumns();
const columns = cols.value.results;
const selectedColumns = ref(columns);
const columnsTable = computed(() => columns.filter(column => selectedColumns.value.includes(column)));



const { data: items } = await useAsyncData('items', () => 
    $fetch(BASE_URL + 'movimentacao/',  {
        params: { 
            q: search.value, 
            page: page.value, 
            size: pageCount.value 
        },
        
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userStore.user.access}`
        }
    }),
    {
        default: () => [], 
        watch: [page, search, pageCount]
        
    })

    console.log(items)


    

async function fetchColumns() {
    return useFetch(BASE_URL + 'cols/?model_view=movimentacao', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userStore.user.access}`
        }
    });
}

async function searchCode(q) {
    loading.value = true;
    try {
        const codes = await $fetch(BASE_URL + 'base_orcamentaria/', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userStore.user.access}`
            },
            params: { q }
        });

        return codes.results.map(code => ({
            id: code.id,
            label: code.detail,
            value: code.codigo_op
        })).filter(Boolean);
    } finally {
        loading.value = false;
    }
}

async function submitForm() {
    const { data: response, error: formError } = await useFetch(BASE_URL + 'movimentacao/', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userStore.user.access}`
        },
        method: 'POST',
        body: payload.value
    });

    if (formError.value) {
        console.log(formError);
        toast.add({ icon: "i-heroicons-exclamation-triangle", color: "red", title: `Erro na requisição - ${formError.value.statusCode}`, description: formError.value.data });
    } else if (response.value) {
        toast.add({ icon: "i-heroicons-check-badge", title: 'Dados Enviados com sucesso!' });
        window.location.reload();
    }
}

watch(detail, async (newValue, oldValue) => {
        if (newValue !== oldValue && detail !== false) {
            payload.value.codigo_op = detail.value.id
        }
    })

</script>


<template>
    <div class="w-full flex flex-col gap-y-4">
        <div class="grid grid-cols-12 gap-4">
            <UCard class="col-span-4">   
                <div class="grid grid-cols-1 gap-4 py-2.5">
                    <UFormGroup required label="Solicitante" name="solicitante">
                        <UInput required type="text" color="gray" v-model="payload.solicitante" disabled />
                    </UFormGroup>

                    <UFormGroup required label="Linha orçamentária" name="codigo_op">
                        <USelectMenu v-model="detail" :loading="loading" :searchable="searchCode" option-attribute="label" trailing by="id"/>
                    </UFormGroup>
                    
                    <UFormGroup required label="Valor" name="valor" hint="Apenas o valor positivo">
                        <UInput required color="gray" v-model.number="payload.valor" />
                    </UFormGroup>

                    <UFormGroup required label="Tipo de movimentação" name="tipo">
                        <USelectMenu required v-model="payload.tipo_movimentacao"  :options="['Corte', 'Incremento']"  />
                    </UFormGroup>

                    <UFormGroup required label="Tipo orçamentário" name="tipo">
                        <USelectMenu required v-model="payload.opcao"  :options="['Antecipo', 'Budget']" />
                    </UFormGroup>

                    <UFormGroup required label="Justificativa" name="justificativa">
                        <UTextarea required autoresize color="gray" v-model="payload.justificativa"/>
                    </UFormGroup>
                </div>
                    
                <div>
                    <UButton class="flex w-full justify-center rounded-md px-3 text-sm font-semibold leading-6 mt-10" variant="solid" label="Enviar" color="gray" @click="submitForm" />              
                </div>
                
            </UCard>
    
            <!-- Table -->
            <UCard class="col-span-8">
                <template #header>
                    <div class="flex flex-wrap justify-between items-center">
                        <div class="flex flex-wrap flex-grow items-center gap-1.5">
                            <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Pesquisa..." />
                        </div>
                        <UPagination size="xs" v-model="page" :page-count="pageCount" :total="items.count" :active-button="{ variant: 'solid' }" :inactive-button="{ color: 'gray' }" :ui="{default: {activeButton: { variant: 'outline'}}}"/>
                    </div>
                </template>

                <UTable
                    style="max-height: 50vh; overflow-y: auto; overflow-x: auto;"
                    :rows="items.results"
                    :columns="columnsTable"
                    sort-asc-icon="i-heroicons-arrow-up"
                    sort-desc-icon="i-heroicons-arrow-down"
                    :ui="{
                        thead: 'text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400',
                        td: { size: 'text-xs', padding:'px-3 py-1', base: 'max-w-[0.5] truncate'},
                        th: { size: 'text-xs', padding:'px-3 py-1', base: 'max-w-[0.5] truncate'},
                        checkbox: {padding: 'ps-4'}, base: 'table-auto truncate'}">

                        <template #valor-data="{ row }">
                            <div class="text-right">{{  $currency(row.valor) }}</div>
                        </template>


                </UTable>
                <template #footer>
                    <span class="text-sm leading-5 font-medium dark:text-white">Apresentando {{ items.count }} resultados de {{ pageFrom }} a {{ pageFor }}</span>
                </template>
            </UCard>
        </div>
    </div>
</template>
