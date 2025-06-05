import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';

// Funkcija za provjeru prijave (koristi /api/check-session rutu)
async function getUserRole() {
  try {
    const res = await fetch('http://localhost:3000/api/check-session', { credentials: 'include' });
    const data = await res.json();
    return data.role || null; // Dobivamo rolu korisnika (korisnik, veterinar, admin)
  } catch (err) {
    console.error('Greška pri provjeri autentičnosti:', err);
    return null;
  }
}

// KLJUČNO: Exportira se FUNKCIJA koja vraća instancu routera
export default function () {
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createWebHistory(process.env.VUE_ROUTER_BASE)
  });

  // Global Navigation Guard za zaštitu ruta
  Router.beforeEach(async (to, from, next) => {
    const role = await getUserRole();

    if (to.meta.requiresAuth && !role) {
      return next('/prijava');
    }

    if (to.meta.requiresKorisnik && role !== 'korisnik') {
      return next('/');
    }

    if (to.meta.requiresVeterinar && role !== 'veterinar') {
      return next('/');
    }

    if (to.meta.requiresAdmin && role !== 'admin') {
      return next('/');
    }

    next();
  });

  return Router;
}
