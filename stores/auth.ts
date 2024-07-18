import { defineStore } from 'pinia'
export const useAuthStore = defineStore('auth', () => {
    const isAuthenticated = ref(false)
    //Set State auth
    function setAuthenticated(ath: boolean){
        isAuthenticated.value = ath
    }
    //Resetting State
    function $reset(){
        isAuthenticated.value = false
    }

    return { isAuthenticated, setAuthenticated, $reset }
},
    {
        persist: {
            storage: persistedState.localStorage
        }
    }
);
