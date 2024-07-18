<template>
<div class="my-5 text-center">
    <UContainer>
        <UCard>
            <div class="text-red-600 text-2xl font-semibold">
                <h1>ERRO {{props.error.statusCode}}</h1>
            </div>
            
            <div class="h-12" />

            <div class="text-xl" v-if="props.error.statusCode === 500">
                <h2>Opa, ocorreu um server error</h2>
                <p>Por favor, contate os responsáveis.</p>
            </div>

            <div class="text-xl" v-else-if="props.error.statusCode === 404">
                <h2>Opa, essa página não existe</h2>
                <p>A página que você está procurando não existe!</p>
            </div>

            <div class="text-xl" v-else-if="props.error.statusCode === 403">
                <h2>Opa, você não pode acessar essa página</h2>
                <p>Seu perfil de acesso não tem permissão para acessar essa página!</p>
            </div>

            <div v-else class="text-xl">
                <h2>Opa, infelizmente ocorreu um erro</h2>
                <p>Por favor, contate os responsáveis</p>
            </div>

            <div class="h-24" />

            <template #footer>
                <UButton color="red" @click="handleError()" label="Retornar para inicio"/>
            </template>
            

        </UCard>
    </UContainer>
</div>
</template>


<script setup>
const props = defineProps({ error: Object })

const handleError = () => clearError({ redirect : '/' })


</script>