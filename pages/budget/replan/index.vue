<template>
    <UContainer>
        <UCard >
            <template #header>
                <h3 class="text-center font-semibold text-2xl">Selecione o arquivo XLSX</h3>
            </template>

            <div class="gap-6 space-y-6">
                
                <div class="space-y-6 grid grid-cols-2 gap-6">
                    <UFormGroup label="Selecione o template das linhas que deseja exportar" required>
                        <USelectMenu v-model="template" :options="layerOptions" required />
                    </UFormGroup>
    
                    <UButton class="flex justify-center text-center" icon="i-material-symbols-cloud-download-outline" :label="template.value" color="gray" :disabled="!template"  :to="url"  />
                </div>

                <UDivider  size="lg" />

                <UInput ref="fileInput" size="lg" type="file" :disabled="!template" />

                <UDivider  size="lg" />

                <UAccordion :items="items" color="gray" variant="ghost" multiple />

                <div class="flex justify-center text-center">
                    <UButton class="w-80 h-10 grid" label="Enviar" color="gray" @click="importXLSX" :loading="loading" />
                </div>

            </div>
        </UCard>
    </UContainer>
</template>


<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '~/stores/user';
const userStore = useUserStore();

const items = [
    { label: 'Editáveis', content: 'Os campos editáveis possuem cor laranja na planilha.', color: 'orange'},
    { label: 'Calculados', content: 'Os campos calculados possuem cor verde na planilha.', color: 'emerald'},
    { label: 'Não editáveis', content: 'Os campos não editáveis possuem cor azul na planilha.', color: 'sky'}
]

const template = ref(false);
const fileInput = ref(null);
const loading = ref(false);
const toast = useToast();
const API_URL = 'https://backup-mazzini.internal.timbrasil.com.br/'

const layerOptions = [
    { label: 'Paula', value: 'template de linhas da Paula' },
    { label: 'Leonardo', value: 'template de linhas do Leonardo' },
    { label: 'Beatriz', value: 'template de linhas da Beatriz' },
    { label: 'Emilio', value: 'template de linhas do Emilio' },
    { label: 'Todas', value: 'template de todas as linhas' },
];

const url = computed(() => {

    if(template.value) {

        if(template.value.label === 'Todas'){
            return `${API_URL}admin/orcamento/documentos/export_mensalizacao/`
        }

        return `${API_URL}admin/orcamento/documentos/export_mensalizacao/?focal_opc=${template.value.label}`

    }

    return ''
        

});



onMounted(() => {
    fileInput.value.$el.addEventListener('change', handleFileUpload);
});



function handleFileUpload(event) {
    // Verifique se o evento e o target existem
    if (event && event.target) {
        // Verifique se o target é um input do tipo file
        if (event.target.type === 'file') {
            // Verifique se files existe e tem pelo menos um arquivo
            if (event.target.files && event.target.files.length > 0) {
                fileInput.value = event.target.files[0];
            }
        } else {
            console.log('O evento change não foi disparado por um input do tipo file');
        }
    } else {
        console.log('O evento ou o target estão undefined');
    }
}

async function importXLSX() {
    const formData = new FormData();
    formData.append('arquivo', fileInput.value);

    toast.add({ icon: "i-material-symbols-alarm-outline-rounded", color: 'yellow', title: 'Processando os dados, aguarde por favor.' });
    loading.value = true;

    const { response, error } = await useFetch(`${API_URL}nuxt/v1/import/mensalizacao/`, {
        method: 'POST',
        body: formData,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userStore.user.access}`
        }
    });

    loading.value = false;

    if (error.value) {
        toast.add({ icon: "i-heroicons-exclamation-triangle", color: "red", title: `Erro na requisição - ${error.value.statusCode}`, description: error.value });
    } 
    if (response.value) {
        toast.add({ icon: "i-heroicons-check-badge", title: 'Dados Enviados com sucesso!' });
    }
}
</script>
