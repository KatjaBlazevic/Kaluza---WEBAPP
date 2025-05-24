import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';

// Funkcija za provjeru prijave (koristi /api/check-session rutu)
async function isAuthenticated() {
  try {
    const res = await fetch('http://localhost:3000/api/check-session', {
      credentials: 'include' // Ključno za slanje cookieja sesije
    });
    const data = await res.json();
    return data.authenticated === true;
  } catch (err) {
    console.error('Greška pri provjeri autentičnosti:', err); // Dodaj log za debugging
    return false;
  }
}

// KLJUČNO: Exportira se FUNKCIJA koja vraća instancu routera
export default function (/* { store, ssrContext } */) {
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    // Koristi createWebHistory s process.env.VUE_ROUTER_BASE za ispravan rad u Quasaru
    history: createWebHistory(process.env.VUE_ROUTER_BASE)
  });

  // Global Navigation Guard
  Router.beforeEach(async (to, from, next) => {
    if (to.meta.requiresAuth) {
      const auth = await isAuthenticated();
      if (auth) {
        next();
      } else {
        // console.log('Korisnik nije prijavljen, preusmjeravanje na prijavu.'); // Debugging
        next('/prijava'); // Preusmjeri na stranicu za prijavu ako nije autentificiran
      }
    } else {
      next(); // Nastavi normalno ako ruta ne zahtijeva autentifikaciju
    }
  });

  return Router; // Vrati instancu routera
}
