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
                            <UTextarea class="tim" size="xl" :ui="{size:{xl: 'text-xl'}}" variant="none" v-model="payload.highlight" autoresize />
  
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
    const getImagePath = (path) => { return `${BASE_URL}${path}resizex=1500&extra=%26var-NovoLayer%3D${payload.value.type_report}`}

    const report_options = [
    {label:'Operations Support Management',             value:'Operations%20Support%20Management'},
    {label:'Office Automation',                         value:'Office%20Automation'},
    {label:'Digital Service Operation Center',          value:'Digital%20Service%20Operation%20Center'},
    {label:'Transport Network Operation',               value:'Transport%20Network%20Operation'},
    {label:'Network Protection Solutions',              value:'Network%20Protection%20Solutions'},
    {label:'Core Network Operation',                    value:'Core%20Network%20Operation'},
    {label:'Access Network Operation',                  value:'Access%20Network%20Operation'},
    {label:'Infrastructure Planning',                   value:'Infrastructure%20Planning'},
    {label:'Infrastructure Planning - Gerencial',       value:'Infrastructure%20Planning%20%2D%20Gerencial'},
    {label:'Industrial Building',                       value:'Industrial%20Building'}
  ]

    const payload = ref({ type_report: 'All', header: `Consumo de Budget - ${Week()}`, highlight: ''})


    const images = computed(() => {
        const imagePaths = [
            getImagePath('jaiminho_uso_orcamento_first_row/?top=100&left=15&right=1985&'),
            getImagePath('jaiminho_uso_orcamento_mensalizacao/?'),
            getImagePath('jaiminho_uso_orcamento_comparativo_real_mensal/?'),
            getImagePath('jaiminho_uso_orcamento_comparativo_real_mensal_tab/?'),
            getImagePath('jaiminho_uso_orcamento_tabela_dinamica/?')
        ]
        return imagePaths 
    })

    const headers = {
        'Operations%20Support%20Management' : 'Operations Support Management',           
        'Office%20Automation' : 'Office Automation',                       
        'Digital%20Service%20Operation%20Center' : 'Digital Service Operation Center',        
        'Transport%20Network%20Operation' : 'Transport Network Operation',             
        'Network%20Protection%20Solutions' : 'Network Protection Solutions',            
        'Core%20Network%20Operation' : 'Core Network Operation',                  
        'Access%20Network%20Operation' : 'Access Network Operation',                
        'Infrastructure%20Planning' : 'Infrastructure Planning',                 
        'Infrastructure%20Planning%20%2D%20Gerencial' : 'Infrastructure Planning - Gerencial',     
        'Industrial%20Building' : 'Industrial Building',                     
  };

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