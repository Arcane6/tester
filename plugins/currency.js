export default defineNuxtPlugin(() => {
    const currency = (value) => {
      if (typeof value !== 'number') {
        value = parseFloat(value);
      }
  
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };
  
    return {
      provide: {
        currency
      }
    };
  });
  