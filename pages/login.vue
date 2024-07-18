<script setup>

definePageMeta({
    layout: 'login'
})

import { useAuthStore } from '~/stores/auth';
import { useUserStore } from '~/stores/user';

const url = 'https://backup-mazzini.internal.timbrasil.com.br/nuxt/v1/'

const authStore = useAuthStore();
const userStore = useUserStore();

const toast = useToast()
const user = ref({ username: '', password: '' });
const showPassword = ref(false)
const pending = ref(false)



const login = async () => {
    pending.value = true
    const { data, error } = await useFetch( url + 'account/login/' , { method: 'POST', body: user })
    pending.value = false

    if(error.value){
        toast.add({title: 'Usuário e/ou senha incorretos', color: 'red', description: error.value.data.detail})
    }

    if(data.value) {
        userStore.setUser(data.value)
        authStore.setAuthenticated(true)
        toast.add({title: 'login bem sucedido, aguarde o redirecionamento...', color: 'blue'})
        return navigateTo('/', { replace: true })
    }
};

</script>

<template>
    <UCard class="mt-32 sm:mx-auto  sm:max-w-xl">
        <template #header>
            <div class="flex justify-center">
                <img class="h-24" src="/nexus_logo_colored.png" />
            </div>
        </template>

        <div class="grid grid-cols-1 gap-4">
            <UFormGroup label="Matricula" >
                <UInput placeholder="Sua matricula" icon="i-heroicons-key" v-model="user.username" class="w-90" />
            </UFormGroup>

            <UFormGroup size="md" label="Senha" >
                <div class="grid grid-cols-1 gap-4">
                    <UInput :type="showPassword ? 'text' : 'password'" placeholder="Sua senha" icon="i-heroicons-key" v-model="user.password" />
                    <UCheckbox label="Mostar senha" @click="showPassword = !showPassword" color="red"/>
                </div>
            </UFormGroup>
        </div>

        <template #footer>
            <UButton 
                size="md" 
                class="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6"
                color="gray"
                label="Login"
                :loading="pending"
                trailing
                @click.prevent="login"
            />
        </template>
    </UCard>
</template>



