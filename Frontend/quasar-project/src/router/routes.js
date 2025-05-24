const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // Početna stranica
      { path: '', component: () => import('pages/IndexPage.vue') },

      // O nama
      { path: 'about', component: () => import('pages/ONamaPage.vue') },

      // Dogadaji
      { path: 'events', component: () => import('pages/DogadajiPage.vue') },

      // Veterinari
      { path: 'vets', component: () => import('pages/VeterinariPage.vue') },

      // Kontakt
      { path: 'contact', component: () => import('pages/KontaktPage.vue') },

      // Registracija (prva faza registracije)
      { path: 'register', component: () => import('pages/RegistracijaPage.vue') },

      // Izrada profila (druga faza registracije)
      { path: 'izrada-profila', component: () => import('pages/IzradaProfilaPage.vue') },

      //Izrada profila ljubimca (treća faza registracije)
      { path: 'dodaj-ljubimca', component: () => import('pages/DodajLjubimcaPage.vue') },

      // Prijava
      { path: 'prijava', component: () => import('pages/PrijavaPage.vue') },

      //Profil
      { path: 'profile', component: () => import('pages/ProfilPage.vue'), meta: { requiresAuth: true } },

      //Uredi profil
      { path: 'uredi-profil', component: () => import('pages/UrediProfilPage.vue'), meta: { requiresAuth: true } },

      //Pregled ljubimca
      { path: 'pregled-ljubimaca', component: () => import('pages/PregledLjubimacaPage.vue'), meta: { requiresAuth: true } },

      //Uredu ljubimca
      { path: 'uredi-ljubimca/:id', component: () => import('pages/UrediLjubimcaPage.vue'), meta: { requiresAuth: true } },
    ]
  },

  // Error 404
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
