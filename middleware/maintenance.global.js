import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";

export default defineNuxtRouteMiddleware(async (to, from) => {
    const BASE_URL = "https://backup-mazzini.internal.timbrasil.com.br/nuxt/v1/"
    const { data: manutencao, error: error } = await useFetch( BASE_URL + 'data_info/3/')
    
    if (to?.name !== 'login') {
        if(manutencao.value.info_active && to?.name !== 'maintenance') {
            return navigateTo('/maintenance', { replace: true});
            }
        }        
})
