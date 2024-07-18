import { defineStore } from 'pinia'
export const useUserStore = defineStore('user', () => {
    const user = ref({})
    //Set State auth
    function setUser(ath: {}){
        user.value = ath
    }
    //Resetting State
    function $reset(){
        user.value = false
    }

    return { user, setUser, $reset }
},
    {
        persist: {
            storage: persistedState.localStorage
        }
    }
);
