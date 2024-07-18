<script setup>
import { useUserStore } from "~/stores/user";


const userStore = useUserStore();
const route = useRoute();
const toast = useToast();
const BASE_URL = "https://backup-mazzini.internal.timbrasil.com.br/nuxt/v1/";
const ITEMS = [
  { key: 'basicos', label: 'Básicos' },
  { key: 'lbo', label: 'LBO & PXQ' },
  { key: 'mensalizacao', label: 'Mensalização' },
  { key: 'justificativa', label: 'Justificativa' }
];

const idParams = computed(() => route.params.id);

const { data: results } = await useAsyncData('results', () => 
  $fetch(`${BASE_URL}base_orcamentaria/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userStore.user.access}`
    },
    query: { id: idParams.value }
  })
);

const obj = results.value.results[0];

const payload = ref({
  ano_budget: obj.ano_budget,
  id_linha_mp_bi: obj.id_linha_mp_bi,
  tag_trienal: obj.tag_trienal,
  layer: obj.layer,
  area_layer: obj.area_layer,
  novo_area_layer: obj.novo_area_layer,
  area_sap: obj.area_sap,
  source: obj.source,
  source_macro: obj.source_macro,
  expenditure: obj.expenditure,
  macro_project: obj.macro_project,
  investment_tree: obj.investment_tree,
  agrupamento: obj.agrupamento,
  classificacao_interna: obj.classificacao_interna,
  classificacao_pec: obj.classificacao_pec,
  element_detail: obj.element_detail,
  detail: obj.detail,
  fornecedor: obj.fornecedor,
  tipo_unidade: obj.tipo_unidade,
  quantidade: obj.quantidade,
  hw_lbo: obj.hw_lbo,
  sw_lbo: obj.sw_lbo,
  se_lbo: obj.se_lbo,
  total_lbo: 0,
  total_pxq: 0,
  valor_total: 0,
  classificacao_lo: obj.classificacao_lo,
  janeiro: obj.janeiro,
  fevereiro: obj.fevereiro,
  marco: obj.marco,
  abril: obj.abril,
  maio: obj.maio,
  junho: obj.junho,
  julho: obj.julho,
  agosto: obj.agosto,
  setembro: obj.setembro,
  outubro: obj.outubro,
  novembro: obj.novembro,
  dezembro: obj.dezembro,
  escopo: obj.escopo,
  beneficio_esperado: obj.beneficio_esperado,
  impacto_nao_realizacao: obj.impacto_nao_realizacao,
  check: 0,
  trava_operacional: obj.trava_operacional,
  investment_tree_detail: obj.investment_tree_detail,
  pxq: obj.pxq,
  waiting_list: obj.waiting_list,
  necessidade: obj.necessidade,
  tipo_lo: obj.tipo_lo,
  conta_contabil: obj.conta_contabil,
  anticipo: obj.anticipo,
  codigo_op: obj.codigo_op,
  novo_layer: obj.novo_layer,
  nova_diretoria: obj.nova_diretoria,
  focal_opc: obj.focal_opc,
  focal_layer: obj.focal_layer,
  nota: obj.nota,
  regional: obj.regional,
  directorship: obj.directorship,
  cenario: obj.cenario
});

const totalLbo = computed(() => payload.value.hw_lbo + payload.value.sw_lbo + payload.value.se_lbo);
const totalPXQ = computed(() => payload.value.quantidade * totalLbo.value);
const checkplan = computed(() => {
  const months = [
    'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  return payload.value.valor_total - months.reduce((acc, month) => acc + payload.value[month], 0);
});

watch([totalLbo, totalPXQ, checkplan], () => {
  payload.value.total_lbo = totalLbo.value;
  payload.value.total_pxq = totalPXQ.value;
  payload.value.valor_total = totalPXQ.value;
  payload.value.check = checkplan.value;
});

async function SalvarModificacoes() {
  const { data: response, error: error } = await useFetch(`${BASE_URL}base_orcamentaria/${idParams.value}/`, {
    method: 'PUT',
    body: JSON.stringify(payload.value),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userStore.user.access}`
    }
  });

  if (error.value) {
    console.error(error.value.data);
    toast.add({
      icon: "i-heroicons-exclamation-triangle",
      color: "red",
      title: "Erro ao tentar salvar modificações."
    });
  }

  if (response.value) {
    toast.add({
      icon: 'i-heroicons-check-badge',
      size: 'sm',
      title: "Linha modificada com sucesso"
    });
    navigateTo('/budget', { replace: true });
  }
}
</script>



<template>
    <div>
        <UButton :ui="{ rounded: 'rounded-full' }" style="text-decoration: none;" class="mb-4 text-sm font-semibold" color="gray" label="Histórico de modificações" :to="`/budget/history/${idParams}`" />

        <UTabs :items="ITEMS">
            <template #item="{ item }">
                <UCard :ui="{ body: { base: 'justify-center' } }">
                    <div class="space-y-4">
                        
                        <div v-if="item.key ==='basicos'" class="space-y-4">
                            <div class="grid grid-cols-4 gap-4">
                                <UFormGroup label="Tipo de Linha Orçamentária" name="tipo_lo">
                                    <USelect v-model="payload.tipo_lo" :options="['LO','CONTINGENCIAMENTO','CORTE']"/>
                                </UFormGroup>

                                <UFormGroup  label="Classificação LO" name="classificacao_lo">
                                    <UInput type="text" v-model="payload.classificacao_lo" disabled color="gray"/>
                                </UFormGroup>

                                <UFormGroup label="Conta Contábil" name="conta_contabil">
                                    <UInput v-model="payload.conta_contabil"/>
                                </UFormGroup>

                                <UFormGroup label="Anticipo" name="anticipo">
                                    <UInput type="number" v-model="payload.anticipo"/>
                                </UFormGroup>

                                <UFormGroup label="Waiting List" name="waiting_list">
                                    <UInput type="number" v-model="payload.waiting_list"/>
                                </UFormGroup>

                                <UFormGroup label="Need of which IPCA" name="need_of_which_ipca">
                                    <UInput type="number" v-model="payload.need_of_which_ipca"/>
                                </UFormGroup>

                                <UFormGroup label="Need escopo negocial" name="need_escopo_negocial">
                                    <UInput type="number" v-model="payload.need_escopo_negocial"/>
                                </UFormGroup>

                                <UFormGroup label="Necessidade" name="necessidade">
                                    <UInput type="number" v-model="payload.necessidade"/>
                                </UFormGroup>

                                                                <UFormGroup required label="Ano Budget" name="ano_budget">
                                    <UInput type="number" v-model="payload.ano_budget" disabled color="gray"/>
                                </UFormGroup>

                                <UFormGroup label="Tag Trienal" name="tag_trienal">
                                    <UInput type="text" v-model="payload.tag_trienal" />
                                </UFormGroup>

                                <UFormGroup label="ID Linha MP" name="id_linha_mp_bi">
                                    <UInput type="text" v-model="payload.id_linha_mp_bi" />
                                </UFormGroup>

                                <UFormGroup label="Regional" name="regional">
                                    <UInput type="text" v-model="payload.regional" />
                                </UFormGroup>
                                
                                <UFormGroup label="Novo Layer" name="novo_layer">
                                    <UInput v-model="payload.novo_layer"/> 
                                </UFormGroup>

                                <UFormGroup label="Nova Diretoria" name="nova_diretoria">
                                    <UInput v-model="payload.nova_diretoria"/>
                                </UFormGroup>

                                <UFormGroup  label="Layer" name="layer">
                                    <USelect :options="['A&F', 'CORE', 'I&PC', 'ISOC', 'OSM', 'TRANSPORT']" v-model="payload.layer"/>
                                </UFormGroup>

                                <UFormGroup  label="Área Layer" name="area_layer" hint="Selecione Layer primeiro">
                                    <div v-if="payload.layer === 'A&F'">
                                        <USelect :options="['A&F']" v-model="payload.area_layer"/>
                                    </div>
                                    <div v-if="payload.layer === 'CORE'">
                                        <USelect :options="['CORE']" v-model="payload.area_layer"/>
                                    </div>
                                    <div v-if="payload.layer === 'I&PC'">
                                        <USelect :options="['I&PC','IBO','IM','OFFICE AUT.']" v-model="payload.area_layer"/>
                                    </div>
                                    <div v-if="payload.layer === 'ISOC'">
                                        <USelect :options="['ISOC']" v-model="payload.area_layer"/>
                                    </div>
                                    <div v-if="payload.layer === 'OSM'">
                                        <USelect :options="['OEM','OSS-A','OSS-S']" v-model="payload.area_layer"/>
                                    </div>
                                    <div v-if="payload.layer === 'TRANSPORT'">
                                        <USelect :options="['TRANSPORT']" v-model="payload.area_layer"/>
                                    </div>
                                </UFormGroup>

                                <UFormGroup  label="Nova área Layer" name="novo_area_layer" >
                                    <UInput type="text" v-model="payload.novo_area_layer" />
                                </UFormGroup>

                                <UFormGroup label="Área SAP" name="area_sap">
                                    <USelect :options="['NW','IT']" v-model="payload.area_sap" />
                                </UFormGroup>          

                                <UFormGroup label="Expenditure" name="expenditure">
                                    <USelect :options="['CAPEX','OPEX', 'OPEX ADM']" v-model="payload.expenditure"/>
                                </UFormGroup>

                                <UFormGroup label="Source Macro" name="source_macro">
                                    <USelect :options="['TIM','FIBER']" v-model="payload.source_macro"/>
                                </UFormGroup>  

                                <UFormGroup label="Source" name="source" hint="Selecione Source Macro primeiro">
                                    <div v-if="payload.source_macro === 'TIM'">
                                        <USelect :options="['TIM','COZANI','FIBER ON GOING','INTELIG']" v-model="payload.source"/>
                                    </div>
                                    <div v-if="payload.source_macro === 'FIBER'">
                                        <USelect :options="['FIBER','FIBER RESIDENCIAL']" v-model="payload.source"/>
                                    </div>     
                                </UFormGroup>

                                <UFormGroup label="Macro Project" name="macro_project">
                                    <UInput type="text" v-model="payload.macro_project"/>
                                </UFormGroup>

                                <UFormGroup label="Investment Tree" name="investment_tree">
                                    <UInput type="text" v-model="payload.investment_tree"/>
                                </UFormGroup>

                                <UFormGroup label="Agrupamento" name="agrupamento">
                                    <UInput type="text" v-model="payload.agrupamento"/>
                                </UFormGroup>

                                <UFormGroup label="Classificação Interna" name="classificacao_interna">
                                    <UInput type="text" v-model="payload.classificacao_interna"/>
                                </UFormGroup>

                                <UFormGroup label="Classificação P&C" name="classificacao_pec">
                                    <UInput type="text" v-model="payload.classificacao_pec"/>
                                </UFormGroup>

                                <UFormGroup label="Element Detail" name="element_detail">
                                    <UInput type="text" v-model="payload.element_detail"/>
                                </UFormGroup>

                                <UFormGroup label="Detail" name="detail">
                                    <UInput type="text" v-model="payload.detail"/>
                                </UFormGroup>

                                <UFormGroup label="Fornecedor" name="fornecedor">
                                    <UInput type="text" v-model="payload.fornecedor"/>
                                </UFormGroup>
                                
                                <UFormGroup label="Trava Operacional" name="trava_operacional">
                                    <UInput type="text" v-model="payload.trava_operacional"/>
                                </UFormGroup>

                                <UFormGroup label="Investment Tree Detail" name="investment_tree_detail">
                                    <UInput type="text" v-model="payload.investment_tree_detail"/>
                                </UFormGroup>

                                <UFormGroup label="PxQ" name="pxq">
                                    <UInput type="text" v-model="payload.pxq"/>
                                </UFormGroup>

                                <UFormGroup label="Directorship" name="directorship">
                                    <USelect :options="['OPERATIONS', 'NET DEV', 'NET DEV TESTE']" v-model="payload.directorship"/>
                                </UFormGroup>

                                <UFormGroup label="Cenário" name="cenario">
                                    <UInput v-model="payload.cenario"/>
                                </UFormGroup>

                            </div>                                 
                        </div>

                        <div v-if="item.key ==='lbo'" class="space-y-4">
                            
                            <div class="grid grid-cols-2 gap-6">
                                <UFormGroup  label="Tipo Unidade(Q)" name="tipo_unidade">
                                    <UInputMenu v-model="payload.tipo_unidade" searchable :options="['Assinatura Anual','Atividades','Atualizações de Sw',
                                    'Capacidade [SIM Card]','Componente','Conectividade','Equipamentos','Ferramenta','Fila','H/H',
                                    'Jornadas','Km Fibra','Laudos','Licenças','LPU mensal','Manutenção Corretiva',
                                    'Mensal','Miscelaneous','NE','Obras e Materiais','Projeto','Qtde de fiscalizações',
                                    'Serviços','Servidores','Sistema','Sites','Sprints','Squad','Terabytes','Testes',
                                    'Torre por End ID','Treinamento','Unidade Computacional','Use Cases','Vídeo aulas','Outro']"/>
                                </UFormGroup>

                                <UFormGroup required label="Quantidade" name="quantidade">
                                    <UInput type="number"  v-model="payload.quantidade"/>
                                </UFormGroup>
                            </div>

                            <div class="grid grid-cols-3 gap-4">
                                <UFormGroup required label="Hardware LBO" name="hw_lbo">
                                    <UInput type="number" v-model="payload.hw_lbo"/>
                                </UFormGroup>

                                <UFormGroup required label="Software LBO" name="sw_lbo">
                                    <UInput type="number" v-model="payload.sw_lbo"/>
                                </UFormGroup>

                                <UFormGroup required label="Service LBO" name="se_lbo">
                                    <UInput type="number" v-model="payload.se_lbo"/>
                                </UFormGroup>

                                <UFormGroup label="Total LBO" name="total_lbo">
                                    <h3>{{ payload.total_lbo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$','') }}</h3>
                                    <UInput type="hidden" v-model="payload.total_lbo" disabled/>  
                                </UFormGroup>

                                <UFormGroup label="Total PXQ" name="total_pxq">
                                    <h3>{{ payload.total_pxq.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$','') }}</h3>
                                    <UInput type="hidden" v-model="payload.total_pxq"/>
                                </UFormGroup>

                                <UFormGroup label="Valor Total" name="valor_total">
                                    <h3>{{ payload.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$','') }}</h3>
                                    <UInput type="hidden" v-model="payload.valor_total"/>
                                </UFormGroup>
                            </div>
                        </div>

                        <div v-if="item.key ==='mensalizacao'" class="space-y-4">
                            <h3 class="text-center mb-4">Mensalize aqui o valor planejado para esta demanda</h3>

                            <UCard>
                                <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th scope="col" class="px-6 py-3">Element Detail</th>
                                            <th scope="col" class="px-6 py-3">Detail</th>
                                            <th scope="col" class="px-6 py-3">Valor Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <td class="px-6 py-4">{{ payload.element_detail }}</td>
                                            <td class="px-6 py-4">{{ payload.detail }}</td>
                                            <td class="px-6 py-4">{{ payload.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$','') }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </UCard>

                            <UFormGroup  label="Check Plan" name="check">
                                <h3>{{ payload.check.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$','') }}</h3>
                                <UInput type="hidden" v-model="payload.check"/>
                            </UFormGroup>

                            <div class="grid grid-cols-12 gap-4">

                                <UFormGroup required  label="Janeiro" name="janeiro">
                                    <UInput type="number" v-model="payload.janeiro"/>
                                </UFormGroup>

                                <UFormGroup required label="Fevereiro" name="fevereiro">
                                    <UInput type="number" v-model="payload.fevereiro"/>
                                </UFormGroup>

                                <UFormGroup required label="Março" name="marco">
                                    <UInput type="number" v-model="payload.marco"/>
                                </UFormGroup>
                                
                                <UFormGroup required label="Abril" name="abril">
                                    <UInput type="number" v-model="payload.abril"/>
                                </UFormGroup>

                                <UFormGroup required label="Maio" name="maio">
                                    <UInput type="number" v-model="payload.maio"/>
                                </UFormGroup>
                                
                                <UFormGroup required label="Junho" name="junho">
                                    <UInput type="number" v-model="payload.junho"/>
                                </UFormGroup>

                                <UFormGroup required label="Julho" name="julho">
                                    <UInput type="number" v-model="payload.julho"/>
                                </UFormGroup>
                                
                                <UFormGroup required label="Agosto" name="agosto">
                                    <UInput type="number" v-model="payload.agosto"/>
                                </UFormGroup>
                                
                                <UFormGroup required label="Setembro" name="setembro">
                                    <UInput type="number" v-model="payload.setembro"/>
                                </UFormGroup>
                                
                                <UFormGroup required label="Outubro" name="outubro">
                                    <UInput type="number" v-model="payload.outubro"/>
                                </UFormGroup>
                                
                                <UFormGroup required label="Novembro" name="novembro">
                                    <UInput type="number" v-model="payload.novembro"/>
                                </UFormGroup>
                                
                                <UFormGroup required label="Dezembro" name="dezembro">
                                    <UInput type="number" v-model="payload.dezembro"/>
                                </UFormGroup>
                            </div>
                        </div>

                        <div v-if="item.key ==='justificativa'" class="space-y-4" >
                            <div class="grid grid-cols-2 gap-4">

                                <UFormGroup label="Focal OPC" name="focal_opc">
                                    <UInput v-model="payload.focal_opc"/>
                                </UFormGroup>

                                <UFormGroup label="Focal Layer" name="focal_layer">
                                    <UInput v-model="payload.focal_layer" />
                                </UFormGroup>
                            </div>

                            <div class="grid grid-cols-4 gap-4">
                                <UFormGroup  label="Escopo/Objeto" name="escopo">
                                    <UTextarea autoresize v-model="payload.escopo"/>
                                </UFormGroup>

                                <UFormGroup  label="Benefício Esperado" name="beneficio_esperado">
                                    <UTextarea autoresize v-model="payload.beneficio_esperado"/>
                                </UFormGroup>
                                
                                <UFormGroup  label="Impacto da Não Realização" name="impacto_nao_realizacao">
                                    <UTextarea autoresize v-model="payload.impacto_nao_realizacao"/>
                                </UFormGroup>

                                <UFormGroup  label="Notas" name="nota">
                                    <UTextarea autoresize v-model="payload.nota"/>
                                </UFormGroup>
                            </div>
                        </div>

                        <UButton color="gray" class="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6" label="Salvar Modificações" @click="SalvarModificacoes()"/>
                    </div>
                </UCard>
                
            </template>
        </UTabs>
    </div>
</template>

