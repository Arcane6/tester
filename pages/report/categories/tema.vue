<template>
    <UContainer>
        <UCard :ui="{ body: { base: 'justify-center' } }">
            <div class="space-y-4 space-x-1">
  
                <UFormGroup  label="Relatório" name="report_name">
                    <USelectMenu v-model="payload.type_report" :options="report_options" value-attribute="value"/>
                </UFormGroup>
            
                <UFormGroup   label="Cabeçalho" name="header">
                    <UInput type="text" v-model="payload.header"/>                    
                </UFormGroup>
                           
                <UButton label="Capturar Layout" name="capture_button" color="red" @click="captureHtml"/>
                
                <div class="space-y-4">
                    <div>
                        <div id="e-mail-container" contenteditable="true" class="text-xl" style="overflow: auto; background-color: white;">
                            <img class="h-auto max-w-full" :src="headerPath" style="max-width:100%; margin-top: 0;">
                            <br>
                            <br>
                            <div style="font-size:20px;font-weight:bolder;color:#113974;">Srs,</div>
                            <br>
                              Segue status do consumo de {{ text }}.
                            <div>
                                Para consultar as linhas orçamentárias em seu detalhe, acesse o 
                                <a href="http://workflowopm03.internal.timbrasil.com.br:9000/budget/chart" style="border-color: white;">Portal OPC</a>
                            </div>
                            <br> 
                            <br> 
                            <div style="font-size:20px;font-weight:bolder;color:#113974;">Highlights: </div>
                            <UTextarea class="tim" size="xl" :ui="{ size:{ xl: 'text-xl' } }" variant="none" v-model="payload.highlight" autoresize />
  
                            <br> 
                            <br> 
                            
                            <div v-for="(image, index) in images" :key="index">
                                <img class="h-auto max-w-full" :src="image">
                            </div>
                            <img class="h-auto max-w-full" src="https://mazzini.internal.timbrasil.com.br/img/449/?resizex=1500" style="max-width:100%; margin-bottom: 0;">
                        </div>
                        
                    </div>
                </div>
            </div>
        </UCard>
    </UContainer>
</template>
  
<script setup>
    import { computed, watch, ref } from "vue"
    const toast = useToast()
    const text = ref('...')
    const BASE_URL = 'https://backup-mazzini.internal.timbrasil.com.br/crop/'
    const headerPath = computed(() => { return `https://mazzini.internal.timbrasil.com.br/img/450/?x=15&y=20&font=30&resizex=1500&text=${payload.value.header}`})
    
    const getImagePath = (path, type) => { 
        if(type !== 1){
            return `${BASE_URL}${path}resizex=1500&extra=%26var-classificacao_interna%3D${payload.value.type_report}`
        }
        
        else{
            return `${BASE_URL}${path}resizex=1500&extra=%26var-classificacao_pec%3D${payload.value.type_report}`
        }
    }

    const report_options = [
    {label:'SYSTEM SUPPORT',                      value:'SYSTEM%20SUPPORT'},
    {label:'SOBRESSALENTES',                      value:'SOBRESSALENTES'},
    {label:'BATERIAS',                            value:'BATERIAS'},
    {label:'PROFESSIONAL SERVICES',               value:'PROFESSIONAL%20SERVICES'},
    {label:'CONTRATO DE CAMPO',                   value:'CONTR.%20CAMPO%20(A%26F)&var-classificacao_interna=CONTR.%20CAMPO%20(TX)&var-classificacao_interna=PR%C3%89DIOS%20INFRA'},

  ]

    const payload = ref({ type_report: 'All', header: `Consumo de Budget - ${Week()}`, highlight: ''})


    const images = computed(() => {

        let imagePaths = []

        if(payload.value.type_report === 'SYSTEM%20SUPPORT'){
            imagePaths = [
            getImagePath('jaiminho_uso_orcamento_first_row/?top=100&left=15&right=1985&', 1),
            getImagePath('jaiminho_uso_orcamento_mensalizacao/?', 1),
            getImagePath('jaiminho_uso_orcamento_comparativo_real_mensal/?', 1),
            getImagePath('jaiminho_uso_orcamento_comparativo_real_mensal_tab/?', 1),
            getImagePath('jaiminho_uso_orcamento_tabela_dinamica/?', 1)
        ]
        }

        else{
            imagePaths = [
            getImagePath('jaiminho_uso_orcamento_first_row/?top=100&left=15&right=1985&', 0),
            getImagePath('jaiminho_uso_orcamento_mensalizacao/?', 0),
            getImagePath('jaiminho_uso_orcamento_comparativo_real_mensal/?', 0),
            getImagePath('jaiminho_uso_orcamento_comparativo_real_mensal_tab/?', 0),
            getImagePath('jaiminho_uso_orcamento_tabela_dinamica/?', 0)
        ]
        }
        
        return imagePaths 
    })

    const headers = {
        'SYSTEM%20SUPPORT':'SYSTEM SUPPORT',                      
        'SOBRESSALENTES':'SOBRESSALENTES',                      
        'BATERIAS':'BATERIAS',
        'PROFESSIONAL%20SERVICES':'PROFESSIONAL SERVICES',               
        'CONTR.%20CAMPO%20(A%26F)&var-classificacao_interna=CONTR.%20CAMPO%20(TX)&var-classificacao_interna=PR%C3%89DIOS%20INFRA':'CONTRATO DE CAMPO',                   
    }

watch(() => {
    const headerSuffix = headers[payload.value.type_report];
    if (headerSuffix) {
        payload.value.header = `Consumo de Budget - ${headerSuffix.toUpperCase()} - ${Week()}`;
        text.value = headerSuffix
    }
});


function Week() {
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 1);
    var diff = now - start;
    var oneDay = 1000 * 60 * 60 * 24;
    var dayOfYear = Math.floor(diff / oneDay);
    var weekOfYear = 'W' + Math.ceil(dayOfYear / 7);
    return weekOfYear;
}

function captureHtml() {
    document.getElementById("e-mail-container").removeAttribute('contenteditable')
    var range = document.createRange();
    range.selectNode(document.getElementById("e-mail-container"));
    window.getSelection().removeAllRanges(); // clear current selection
    window.getSelection().addRange(range); // to select text
    document.execCommand("copy");
    document.getElementById("e-mail-container").setAttribute('contenteditable', 'true')

    toast.add({ title: 'Documento copiado para área de transferências!', timeout: 10000 })
}

</script>


<style scoped>
div #e-mail-container { font-family: "TIM Sans"; }

.tim { font-family: "TIM Sans"; }
</style>