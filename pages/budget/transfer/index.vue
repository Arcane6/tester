
<script setup>
import { ref, computed, watch } from 'vue'
import { useUserStore } from '~/stores/user';

const userStore = useUserStore();
const isOpen = ref(false)
const toast = useToast()

const search = ref('')
const page = ref(1)
const pageCount = ref(50)
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
const pageFor = computed(() => pageFrom.value + (pageCount.value - 1))

const detail_saida = ref(false)
const detail_entrada = ref(false)
const options_entrada = ref([])
const loading_opcoes_saida = ref(false)
const loading_opcoes_entrada = ref(false)
const disabled_entrada = ref(true)
const BASE_URL = 'https://backup-mazzini.internal.timbrasil.com.br/nuxt/v1/';


const { data: items, status, refresh } = await useAsyncData('items', () => 
    $fetch(BASE_URL + 'transferencia/', {
    query: { 
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

const payload = ref({ 
    solicitante: userStore.user.name, 
    codigo_op_saida: '', 
    valor_saida: 0, 
    codigo_op_entrada: '', 
    valor_entrada: 0, 
    justificativa: '', 
    tipo: '' 
})

// observa as mudanças de escolha no detail de saida
watch(detail_saida, async (newValue, oldValue) => {
    if (newValue !== oldValue && detail_saida !== false) {

        detail_entrada.value =''
        loading_opcoes_entrada.value = true
        
        const codes = await $fetch(
            BASE_URL+'base_orcamentaria/', {
                query: { 
                q: search.value, 
                page: page.value, 
                size: pageCount.value,
                area_sap: detail_saida.value.area_sap,
                expenditure: detail_saida.value.expenditure,
                macro_project: detail_saida.value.macro_project,
                },
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userStore.user.access}`
                }

        })

        options_entrada.value = codes.results.map(code => (
            { 
                id: code.id, 
                label: code.detail, 
                area_sap: code.area_sap, 
                macro_project: code.macro_project, 
                expenditure: code.expenditure, 
                valor_transf_bgt: code.valor_transf_bgt, 
                valor_transf_antecipo: code.valor_transf_antecipo 
            })).filter(Boolean)
        
        loading_opcoes_entrada.value = false
        disabled_entrada.value = false        
    }
})


// função de pesquisa assincrona
async function searchCode (q) {
        loading_opcoes_saida.value = true
        const codes = await $fetch(
            BASE_URL+'base_orcamentaria/', { 
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userStore.user.access}`
                }, 
                params: { q }
            })
        loading_opcoes_saida.value = false  
        return codes.results.map(code => (
            { 
                id: code.id, 
                label: code.detail, 
                area_sap: code.area_sap, 
                macro_project: code.macro_project, 
                expenditure: code.expenditure, 
                valor_transf_bgt: code.valor_transf_bgt, 
                valor_transf_antecipo: code.valor_transf_antecipo 
            })).filter(Boolean)
}

// função que envia o formulário
async function submitForm() {

    payload.value.codigo_op_saida = detail_saida.value.id
    payload.value.codigo_op_entrada = detail_entrada.value.id
    payload.value.valor_entrada = payload.value.valor_entrada

    console.log(payload.value)


  const { response, error } = await useFetch(
    BASE_URL+'transferencias/', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userStore.user.access}`
        },
        body: payload,
        method: 'POST'
  });
  
  if (error.value) {
    console.log(error.value)
    toast.add({ icon:"i-heroicons-exclamation-triangle", color: "red", title: `Erro na requisição - ${error.value.statusCode}`, description: error.value.data});
  } 
  
  if (response.value) {
    toast.add({ icon:"i-heroicons-check-badge", title: 'Dados Enviados com sucesso!' });
    window.location.reload()
  }
}

</script>


<template>
    <div>
        <div class="w-full flex flex-col gap-y-4">
            <div class="grid grid-cols-12 gap-4">
                <UCard class="col-span-5">   
                    <UAlert title="Atenção!" variant="subtle" color="purple" :ui="{ title : 'text-2xl font-medium'}"  >
                        <template #description>
                            <div class="grid gap-4">
                                <span class="text-violet-800 text-base dark:text-white font-semibold">Só é possível realizar transferências entre linhas que possuem os mesmos:</span>
                                <span class="text-violet-800 text-base dark:text-white font-bold">Expenditure | Área SAP | Macro Project</span>
                            </div>
                        </template>
                    </UAlert> 

                    <div class="grid grid-cols-1 gap-4 py-2.5">
                        <UFormGroup required label="Solicitante" name="solicitante">
                            <UInput required type="text" color="gray" v-model="payload.solicitante" disabled />
                        </UFormGroup>

                        <UFormGroup required label="Linha de Saída" name="codigo_op_saida">
                            <USelectMenu required v-model="detail_saida" :searchable="searchCode" :loading="loading_opcoes_saida" trailing option-attribute="label" by="id" />
                        </UFormGroup>
                            
                        <UFormGroup required label="Linha de Entrada" name="codigo_op_entrada">
                            <USelectMenu required v-model="detail_entrada" :options="options_entrada" searchable :loading="loading_opcoes_entrada" :disabled="disabled_entrada" trailing option-attribute="label" by="id" />
                        </UFormGroup>

                        <UFormGroup required label="Valor" name="valor_saida" hint="Apenas o valor positivo">
                            <UInput required  color="gray" v-model.number="payload.valor_saida"/>
                        </UFormGroup>

                        <UFormGroup required label="Tipo de Transferência" name="tipo">
                            <USelect required v-model="payload.tipo"  :options="['ANTECIPO', 'BUDGET']" placeholder="Selecione o tipo de transferência" />
                        </UFormGroup>

                        <UFormGroup required label="Justificativa" name="justificativa">
                            <UTextarea required autoresize color="gray" v-model="payload.justificativa"/>
                        </UFormGroup>
                    </div>
            
                    <div>
                        <UButton class="flex w-full justify-center rounded-md px-3 text-sm font-semibold leading-6 mt-10" variant="solid" label="Enviar" color="gray" @click="isOpen = true" />              
                    </div>
                    
                </UCard>
        
                <UCard class="col-span-7">
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
                        :ui="{
                            thead: 'text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400',
                            td: { size: 'text-xs', padding:'px-3 py-1', base: 'max-w-[0.5] truncate'},
                            th: { size: 'text-xs', padding:'px-3 py-1', base: 'max-w-[0.5] truncate'},
                            checkbox: {padding: 'ps-4'}, base: 'table-auto truncate'}">

                    </UTable>

                    <template #footer>
                        <span class="text-sm leading-5 font-medium">Apresentando {{ items.count }} resultados de {{ pageFrom }} a {{ pageFor }}</span>
                    </template>

                </UCard>
            </div>
        </div>

        <UModal :ui="{ width: 'sm:max-w-[900px]', height: 'h-[400px]' }" v-model="isOpen">
            <UCard class="h-full w-full">
                <template #header>
                    <h2>Resultados</h2>
                </template>
                <div class="grid gap-4">
                    <table class="table-auto bg-red-100 rounded-lg shadow-lg text-center border-collapse w-full">
                        <tr>
                            <th class="bg-red-500 text-white border w-1/2">Detail de saida</th>
                            <th class="border text-black w-1/2">{{ detail_saida.label }}</th>
                        </tr>
                        <tr>
                            <th class="bg-red-500 text-white border w-1/2" v-if="payload.tipo === 'BUDGET'">Valor operativo de budget</th>
                            <th class="bg-red-500 text-white border w-1/2" v-else>Valor operativo de antecipo</th>
                            <td class="border text-black w-1/2" v-if="payload.tipo === 'BUDGET'">{{ $currency(Number(detail_saida.valor_transf_bgt)) }} - {{$currency(Number(payload.valor_saida))}} </td>
                            <td class="border text-black w-1/2" v-else>{{ detail_saida.valor_transf_antecipo }} - {{payload.valor_saida}} </td>
                        </tr>
                        <tr>
                            <th class="bg-red-500 text-white border w-1/2" v-if="payload.tipo === 'BUDGET'">Total bgt </th>
                            <th class="bg-red-500 text-white border w-1/2" v-else>Total antecipo </th>
                            <td class="border text-black w-1/2" v-if="payload.tipo === 'BUDGET'">{{ $currency(Number(detail_saida.valor_transf_bgt) - Number(payload.valor_saida)) }}</td>
                            <td class="border text-black w-1/2" v-else>{{ $currency(Number(detail_saida.valor_transf_antecipo) - Number(payload.valor_saida)) }} </td>
                        </tr>
                    </table>

                    <table class="table-auto bg-green-100 rounded-lg shadow-lg text-center border-collapse w-full">
                        <tr>
                            <th class="bg-emerald-500 text-white border w-1/2">Detail de entrada</th>
                            <th class="border text-black w-1/2">{{ detail_entrada.label }}</th>
                        </tr>
                        <tr>
                            <th class="bg-emerald-500 text-white border w-1/2" v-if="payload.tipo === 'BUDGET'">Valor operativo de budget</th>
                            <th class="bg-emerald-500 text-white border w-1/2" v-else>Valor operativo de antecipo</th>
                            <td class="border text-black w-1/2" v-if="payload.tipo === 'BUDGET'">{{ $currency(Number(detail_entrada.valor_transf_bgt)) }} + {{ $currency(Number(payload.valor_saida)) }} </td>
                            <td class="border text-black w-1/2" v-else>{{ $currency(Number(detail_entrada.valor_transf_antecipo)) }} + {{ $currency(Number(payload.valor_saida)) }} </td>
                        </tr>
                        <tr>
                            <th class="bg-emerald-500 text-white border w-1/2" v-if="payload.tipo === 'BUDGET'">Total bgt </th>
                            <th class="bg-emerald-500 text-white border w-1/2" v-else>Total antecipo </th>
                            <td class="border text-black w-1/2" v-if="payload.tipo === 'BUDGET'">{{$currency(Number(detail_entrada.valor_transf_bgt) + Number(payload.valor_saida)) }}</td>
                            <td class="border text-black w-1/2" v-else>{{ $currency(Number(detail_entrada.valor_transf_antecipo) + Number(payload.valor_saida)) }} </td>
                        </tr>
                    </table>
                </div>

                <template #footer>
                    <div class="flex justify-center text-center">
                        <UButton class="w-80 h-10 grid" label="Enviar" color="gray" @click="submitForm" />
                    </div>
                </template>
            </UCard>
        </UModal>
    </div>
</template>

