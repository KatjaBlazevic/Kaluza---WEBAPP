// src/boot/pinia.js
import { createPinia } from 'pinia';
import { useUserStore } from 'src/stores/user';

export default async ({ app }) => {
  const pinia = createPinia();
  app.use(pinia);

  const userStore = useUserStore();
  // KLJUČNO: Ovdje osiguravamo da se inicijalizacija završi PRIJE nego što se app uopće pokrene.
  await userStore.initializeUser(); // Čeka da se userStore popuni iz localStoragea

  console.log('Quasar Boot: Pinia initialized. User store initialized with data from localStorage.');
  console.log('Quasar Boot: userStore.isAuthenticated:', userStore.isAuthenticated, 'userStore.getUserRole:', userStore.getUserRole); // DODANI LOG
};
