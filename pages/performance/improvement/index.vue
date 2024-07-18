<template>
    
    <UContainer >
        <UCard>
            <template #header>
                <UAlert description="Caso tenha algum dica ou solicitação, preencha o formulário." title="Nos ajude a melhorar!" color="teal" :avatar="{ src: '/logotype_white.png', size: '3xl' }" :ui="{ title: 'text-xl font-medium' }"  />
            </template>

            <div class="justify-center space-y-5 px-12">
                <UFormGroup label="Solicitante">
                    <UInput v-model="payload.requester" disabled color="gray" icon="i-material-symbols-person"  />
                </UFormGroup>

                <UFormGroup label="Motivo da solicitação" required >
                    <UTextarea v-model="payload.reason" color="gray"  />
                </UFormGroup>

                <UFormGroup label="Descrição" required  >
                    <UTextarea placeholder="Descreva com detalhes o item solicitado" v-model="payload.description" color="gray" />
                </UFormGroup>
            </div>
            
            <template #footer>
                <div class="flex justify-center">
                    <UButton label="Enviar" color="gray" class="justify-center py-3 w-1/3" @click="submitForm()" :loading="loading" />
                </div>
            </template>

        </UCard>
    </UContainer>
</template>

<script setup>
import { useUserStore } from '~/stores/user';

// Constantes
const BASE_URL = "https://backup-mazzini.internal.timbrasil.com.br/nuxt/v1/";

// Referências e estados
const userStore = useUserStore();
const toast = useToast();
const loading = ref(false);
const payload = ref({ requester: userStore.user.name, reason: '', description: '', status: null });

// Funções
async function submitForm() {
    loading.value = true;

    const { data: attrs, error } = await useFetch(`${BASE_URL}improvement/`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userStore.user.access}`
        },
        body: payload
    });

    loading.value = false;

    if (error.value) {
        toast.add({
            icon: "i-heroicons-exclamation-triangle",
            color: 'red',
            title: 'Ocorreu um erro durante o envio do formulário, tente novamente mais tarde.',
            description: error.value
        });
    } else if (attrs.value) {
        toast.add({
            icon: "i-heroicons-check-badge",
            color: 'purple',
            title: 'Dados enviados, retornaremos em breve!'
        });
        window.location.reload();
    }
}
</script>
