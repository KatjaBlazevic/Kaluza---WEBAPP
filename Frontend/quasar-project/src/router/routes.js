const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // Početna stranica
      { path: '', component: () => import('src/pages/OSNOVNE/IndexPage.vue') },

      // O nama
      { path: 'about', component: () => import('src/pages/OSNOVNE/ONamaPage.vue') },

      // Dogadaji
      { path: 'events', component: () => import('src/pages/OSNOVNE/DogadajiPage.vue') },

      // Veterinari
      { path: 'vets', component: () => import('src/pages/OSNOVNE/VeterinariPage.vue') },

      // Kontakt
      { path: 'contact', component: () => import('src/pages/OSNOVNE/KontaktPage.vue') },

      // Registracija (prva faza registracije)
      { path: 'register', component: () => import('src/pages/AUTH/RegistracijaPage.vue') },

      // Izrada profila (druga faza registracije)
      { path: 'izrada-profila', component: () => import('src/pages/AUTH/IzradaProfilaPage.vue') },

      //Izrada profila ljubimca (treća faza registracije)
      { path: 'dodaj-ljubimca', component: () => import('src/pages/AUTH/DodajLjubimcaPage.vue') },

      // Prijava
      { path: 'prijava', component: () => import('src/pages/AUTH/PrijavaPage.vue') },

      //Profil
      { path: 'profile', component: () => import('src/pages/PROFIL/ProfilPage.vue'), meta: { requiresAuth: true } },

      //Uredi profil
      { path: 'uredi-profil', component: () => import('src/pages/PROFIL/UrediProfilPage.vue'), meta: { requiresAuth: true } },

      //Pregled ljubimca
      { path: 'pregled-ljubimaca', component: () => import('src/pages/PROFIL/PregledLjubimacaPage.vue'), meta: { requiresAuth: true } },

      //Uredi ljubimca
      { path: 'uredi-ljubimca/:id', component: () => import('src/pages/PROFIL/UrediLjubimcaPage.vue'), meta: { requiresAuth: true } },

      //Galerija
      { path: 'galerija', component: () => import('src/pages/PROFIL/GALERIJA/GalerijaPage.vue'), meta: { requiresAuth: true } },

      //Dodaj sliku
      { path: 'dodaj-sliku', component: () => import('src/pages/GALERIJA/PROFIL/DodajSlikuPage.vue'), meta: { requiresAuth: true } },

      //Otvori sliku
      { path: '/slika/:SIFRA_SLIKE', name: 'SlikaPage', component: () => import('src/pages/PROFIL/GALERIJA/SlikaPage.vue'), meta: { requiresAuth: true } },

      // Uredi sliku
      { path: '/slika/:SIFRA_SLIKE/uredi', name: 'UrediSlikuPage', component: () => import('src/pages/PROFIL/GALERIJA/UrediSlikuPage.vue'), meta: { requiresAuth: true } },

      // Podsjetnici
      { path: 'podsjetnici', name: 'PodsjetniciPage', component: () => import('src/pages/PROFIL/PODSJETNICI/PodsjetniciPage.vue'), meta: { requiresAuth: true } },

       // Dodaj podsjetnik
      { path: 'dodaj-podsjetnik', name: 'DodajPodsjetnikPage', component: () => import('src/pages/PROFIL/PODSJETNICI/DodajPodsjetnikPage.vue'), meta: { requiresAuth: true } },

       // Dnevnik
      { path: 'dnevnik', name: 'DnevnikPage', component: () => import('src/pages/PROFIL/DNEVNIK/DnevnikPage.vue'), meta: { requiresAuth: true } },

      // Dodaj unos u dnevnik
      { path: 'dodaj-unos', name: 'DodajUnosPage', component: () => import('src/pages/PROFIL/DNEVNIK/DodajUnosPage.vue'), meta: { requiresAuth: true } },

      // Prikaz termina - korisnik
      { path: 'termin', name: 'KorisnikTerminPage', component: () => import('src/pages/KorisnikTerminPage.vue'), meta: { requiresAuth: true } },
    ]
  },

  // Error 404
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
