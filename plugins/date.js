import dayjs from "dayjs";

const date = (day) => dayjs(day).format('DD/MM/YYYY');

export default defineNuxtPlugin(() => {
  return {
    provide: {
      date
    }
  };
});
