import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { useAuthStore } from "~/stores/auth";
import { useUserStore } from "~/stores/user";

export default defineNuxtRouteMiddleware(async(to, from) => {
    const userStore = useUserStore();
    const authStore = useAuthStore();
    const url = "https://backup-mazzini.internal.timbrasil.com.br/nuxt/v1/";

    const resetStoresAndRedirect = async (path) => {
        authStore.setAuthenticated(false);
        authStore.$reset();
        userStore.$reset();
        return navigateTo(path, { replace: true });
    };


    if (authStore.isAuthenticated && to.name !== 'login') {
        try {
            const { data: attrs } = await useAsyncData('attrs', async () => {
                const [ auth, admin ] = await Promise.all([
                    $fetch(url + 'checkauth/', { credentials: 'include', headers: { 'Authorization': `Bearer ${userStore.user.access}` } }),
                    $fetch(url + 'permission/', { credentials: 'include', headers: { 'Authorization': `Bearer ${userStore.user.access}` } })
                ]);

                return {
                    isAuthenticated: auth.isAuthenticated,
                    isAdmin: admin.isAdmin
                };
            });

            if (!attrs.value.isAuthenticated) {
                return resetStoresAndRedirect("/login");
            }

            userStore.user.isAdmin = attrs.value.isAdmin;

        } catch (error) {
            if (error.statusCode === 401) {
                return resetStoresAndRedirect("/login");
            }
            console.log(error);
        }
    }

    if (authStore.isAuthenticated && to.name === 'login') {
        return navigateTo("/", { replace: true });
    }

    if (!authStore.isAuthenticated && to.name !== 'login') {
        return navigateTo("/login", { replace: true });
    }
});
