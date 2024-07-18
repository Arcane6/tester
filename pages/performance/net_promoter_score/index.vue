<template>
    <UContainer>
        <UCard>
            <template #header>
                <UAlert description="Conta pra gente como está sendo a sua experiência com essa aplicação!" title="Nos ajude a melhorar!" color="teal" :avatar="{ src: '/logotype_white.png', size: '3xl' }" :ui="{ title: 'text-xl font-medium' }"  />
            </template>

            <div class="justify-center space-y-5 px-12">
                <UFormGroup label="Solicitante">
                    <UInput v-model="payload.user" disabled color="gray" icon="i-material-symbols-person"  />
                </UFormGroup>

                <UFormGroup label="Usabilidade">
                    <div class="flex gap-4">
                        <URange class="w-11/12" :min="1" :max="10" v-model="payload.usability_score" :color="scoreColor(payload.usability_score)" />
                        <UIcon :class="scoreClass(payload.usability_score)" :name="scoreEmote(payload.usability_score)" />
                        <div :class="scoreClassPoint(payload.usability_score)">{{ payload.usability_score }}</div>
                    </div>
                </UFormGroup>

                <UFormGroup label="Performace">
                    <div class="flex gap-4">
                        <URange class="w-11/12" :min="1" :max="10" v-model="payload.performance_score" :color="scoreColor(payload.performance_score)" />
                        <UIcon :class="scoreClass(payload.performance_score)" :name="scoreEmote(payload.performance_score)" />
                        <div :class="scoreClassPoint(payload.performance_score)">{{ payload.performance_score }}</div>
                    </div>
                </UFormGroup>

                <UFormGroup label="Suporte">
                    <div class="flex gap-4">
                        <URange class="w-11/12" :min="1" :max="10" v-model="payload.support_score" :color="scoreColor(payload.support_score)" />
                        <UIcon :class="scoreClass(payload.support_score)" :name="scoreEmote(payload.support_score)" />
                        <div :class="scoreClassPoint(payload.support_score)">{{ payload.support_score }}</div>
                    </div>
                </UFormGroup> 

                <UFormGroup label="Recursos">
                    <div class="flex gap-4">
                        <URange class="w-11/12" :min="1" :max="10" v-model="payload.features_score" :color="scoreColor(payload.features_score)" />
                        <UIcon :class="scoreClass(payload.features_score)" :name="scoreEmote(payload.features_score)" />
                        <div :class="scoreClassPoint(payload.features_score)">{{ payload.features_score }}</div>
                        
                    </div>
                </UFormGroup>

                <UFormGroup label="Integrações">
                    <div class="flex gap-4">
                        <URange class="w-11/12" :min="1" :max="10" v-model="payload.integration_score" :color="scoreColor(payload.integration_score)" />
                        <UIcon :class="scoreClass(payload.integration_score)" :name="scoreEmote(payload.integration_score)" />
                        <div :class="scoreClassPoint(payload.integration_score)">{{ payload.integration_score }}</div>
                        
                    </div>
                </UFormGroup>

                <UFormGroup label="Feedback geral">
                    <UTextarea v-model="payload.feedback" color="gray" />
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
import { useUserStore } from "~/stores/user";
const userStore = useUserStore()
const toast = useToast()
const loading = ref(false)
const payload = ref({ user: userStore.user.name, usability_score: 1, performance_score: 1, support_score: 1, features_score: 1, integration_score: 1, feedback: ''  })
const url = 'https://backup-mazzini.internal.timbrasil.com.br/nuxt/v1/'

const scoreClass = (score) => {
    if (score <= 4){
        return 'text-red-500 h-8 w-8'
    }
    else if (score >=5  && score <= 7){
        return 'text-orange-500 h-8 w-8'
    }
    else if (score >= 8 && score <= 9){
        return 'text-green-500 h-8 w-8'
    }
    else {
        return 'text-teal-500 h-8 w-8'
    }
}

const scoreColor = (score) => {
    if (score <= 4){
        return 'red'
    }
    else if (score >=5  && score <= 7){
        return 'orange'
    }
    else if (score >= 8 && score <= 9){
        return 'green'
    }
    else {
        return 'teal'
    }
}

const scoreEmote = (score) => {
    if (score <= 4){
        return 'i-material-symbols-sentiment-sad-rounded'
    }
    else if (score >= 5 && score <= 7){
        return 'i-material-symbols-sentiment-neutral'
    }
    else if (score >= 8 && score <= 9){
        return 'i-material-symbols-sentiment-satisfied'
    }
    else {
        return 'i-material-symbols-sentiment-excited'
    }
}

const scoreClassPoint = (score) => {
    if (score <= 4){
        return 'text-red-500 font-bold'
    }
    else if (score >=5  && score <= 7){
        return 'text-orange-500 font-bold'
    }
    else if (score >= 8 && score <= 9){
        return 'text-green-500 font-bold'
    }
    else {
        return 'text-teal-500 font-bold'
    }
}


async function submitForm(){
    loading.value = true

    const {data: attrs, error: error } = await useFetch(url + 'nps/', {
        method: 'POST',
        body: payload,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userStore.user.access}`
        }
    })

    loading.value = false

    if(error.value) {
        console.log(error)
        toast.add({ icon: "i-heroicons-exclamation-triangle", color: 'red', title: 'Ocorreu um erro durante o envio do formulário, tente novamente mais tarde.', description: error.value });
    }
    else {
        toast.add({ icon: "i-heroicons-check-badge", color: 'purple', title: 'Dados enviados, retornaremos em breve!' });
        window.location.reload()
    }
}

</script>