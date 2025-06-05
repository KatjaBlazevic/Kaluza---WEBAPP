// src/router/index.js
import { route } from 'quasar/wrappers';
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router';
import routes from './routes'; // Import your routes
import { useUserStore } from 'src/stores/user';

export default route(function ({ store }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore(store);

    if (!userStore.isAuthenticated && localStorage.getItem('token')) {
        console.log('Router Guard: Token found, but Pinia store not authenticated. Attempting to initialize user...');
        await userStore.initializeUser();
    }

    const isAuthenticated = userStore.isAuthenticated;
    const userRole = userStore.getUserRole;

    console.log(`Router Guard: Checking route: ${to.path} IsAuthenticated: ${isAuthenticated} UserRole: '${userRole}'`); // Dodan '' oko uloge

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    // ✅ KLJUČNA PROMJENA U LOGIRANJU requiredRole
    let requiredRole = null;
    const matchedWithRole = to.matched.find(record => record.meta.role);
    if (matchedWithRole) {
        requiredRole = matchedWithRole.meta.role;
    }
    console.log(`Router Guard: Route '${to.path}' meta.role: '${requiredRole}'`); // Dodan '' oko uloge

    if (requiresAuth) {
      if (!isAuthenticated) {
        console.warn('Router Guard: Not authenticated. Redirecting to /prijava.');
        next('/prijava');
      } else {
        // Korisnik je autentificiran, sada provjeri ulogu ako je ruta zahtijeva
        if (requiredRole && userRole !== requiredRole) {
          console.warn(`Router Guard: Permission denied for route '${to.path}'. Required role: '${requiredRole}', User role: '${userRole}'. Redirecting.`);

          // Preusmjeri korisnika na odgovarajuću početnu stranicu/dashboard
          if (userRole === 'korisnik') {
            next('/profile');
          } else if (userRole === 'veterinar') {
            next('/profile-veterinar');
          } else if (userRole === 'admin') {
            next('/admin');
          } else {
            next('/');
          }
        } else {
          // ✅ DODAJ OVAJ LOG KADA JE ULOGA USPJEŠNO PROVJERENA
          console.log(`Router Guard: Permission GRANTED for route '${to.path}'. User role: '${userRole}', Required role: '${requiredRole}'.`);
          next(); // Dozvoli pristup
        }
      }
    } else {
      // ... (ostatak koda za javne rute) ...
      if (isAuthenticated && (to.path === '/prijava' || to.path === '/register' || to.path === '/izrada-profila' || to.path === '/dodaj-ljubimca')) {
        console.warn('Router Guard: Logged in user trying to access login/registration related page. Redirecting to appropriate dashboard.');
        if (userRole === 'korisnik') {
          next('/profile');
        } else if (userRole === 'veterinar') {
          next('/profile-veterinar');
        } else if (userRole === 'admin') {
          next('/admin');
        } else {
          next('/');
        }
      } else {
        next();
      }
    }
});

  return Router;
});
