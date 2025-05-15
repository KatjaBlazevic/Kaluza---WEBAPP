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

      // Profil
      { path: 'profile', component: () => import('pages/ProfilPage.vue') },

      // Registracija
      { path: 'register', component: () => import('pages/RegistracijaPage.vue') }
    ]
  },

  // Error 404
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
