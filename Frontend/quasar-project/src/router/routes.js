const routes = [
  // 📌 Korisničke i veterinarske rute unutar `MainLayout.vue`
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/OSNOVNE/IndexPage.vue'), meta: { public: true } }, 
      { path: 'about', component: () => import('src/pages/OSNOVNE/ONamaPage.vue'), meta: { public: true } },
      { path: 'events', component: () => import('src/pages/OSNOVNE/DogadajiPage.vue'), meta: { public: true } },
      { path: 'vets', component: () => import('src/pages/OSNOVNE/VeterinariPage.vue'), meta: { public: true } },
      { path: 'contact', component: () => import('src/pages/OSNOVNE/KontaktPage.vue'), meta: { public: true } },
      { path: 'prijava', component: () => import('src/pages/AUTH/PrijavaPage.vue'), meta: { public: true } },
      { path: 'register', component: () => import('src/pages/AUTH/RegistracijaPage.vue'), meta: { public: true } },
      { path: 'izrada-profila', component: () => import('src/pages/AUTH/IzradaProfilaPage.vue'), meta: { public: true } },
      { path: 'dodaj-ljubimca', component: () => import('src/pages/AUTH/DodajLjubimcaPage.vue'), meta: { public: true } },
      { path: 'profile', component: () => import('src/pages/PROFIL/ProfilPage.vue'), meta: { requiresAuth: true, role: 'korisnik'} },
      { path: 'uredi-profil', component: () => import('src/pages/PROFIL/UrediProfilPage.vue'), meta: { requiresAuth: true, role: 'korisnik'} },
      { path: 'pregled-ljubimaca', component: () => import('src/pages/PROFIL/PregledLjubimacaPage.vue'), meta: { requiresAuth: true, role: 'korisnik'} },
      { path: 'uredi-ljubimca/:id', component: () => import('src/pages/PROFIL/UrediLjubimcaPage.vue'), meta: { requiresAuth: true, role: 'korisnik'} },
      { path: 'galerija', component: () => import('src/pages/PROFIL/GALERIJA/GalerijaPage.vue'), meta: { requiresAuth: true, role: 'korisnik'} },
      { path: 'dodaj-sliku', component: () => import('src/pages/PROFIL/GALERIJA/DodajSlikuPage.vue'), meta: { requiresAuth: true, role: 'korisnik'} },
      { path: '/slika/:SIFRA_SLIKE', name: 'SlikaPage', component: () => import('src/pages/PROFIL/GALERIJA/SlikaPage.vue'), meta: { requiresAuth: true, role: 'korisnik'} },
      { path: '/slika/:SIFRA_SLIKE/uredi', name: 'UrediSlikuPage', component: () => import('src/pages/PROFIL/GALERIJA/UrediSlikuPage.vue'), meta: { requiresAuth: true, role: 'korisnik'} },
      { path: 'podsjetnici', name: 'PodsjetniciPage', component: () => import('src/pages/PROFIL/PODSJETNICI/PodsjetniciPage.vue'), meta: { requiresAuth: true, role: 'korisnik'} },
      { path: 'dodaj-podsjetnik', name: 'DodajPodsjetnikPage', component: () => import('src/pages/PROFIL/PODSJETNICI/DodajPodsjetnikPage.vue'), meta: { requiresAuth: true, role: 'korisnik'} },
      { path: 'dnevnik', name: 'DnevnikPage', component: () => import('src/pages/PROFIL/DNEVNIK/DnevnikPage.vue'), meta: { requiresAuth: true }, role: 'korisnik'},
      { path: 'dodaj-unos', name: 'DodajUnosPage', component: () => import('src/pages/PROFIL/DNEVNIK/DodajUnosPage.vue'), meta: { requiresAuth: true, role: 'korisnik'} },
      { path: 'termin', name: 'KorisnikTerminPage', component: () => import('src/pages/PROFIL/TERMIN/KorisnikTerminPage.vue'), meta: { requiresAuth: true, role: 'korisnik'} },
      { path: 'dokumenti', name: 'DokumentiPage', component: () => import('src/pages/PROFIL/DOKUMENTI/DokumentiPage.vue'), meta: { requiresAuth: true, role: 'korisnik'} },
      { path: 'profile-veterinar', name: 'VeterinarProfilPage', component: () => import('src/pages/VETERINAR/VeterinarProfilPage.vue'), meta: { requiresAuth: true, role: 'veterinar'} },
      { path: 'termin-veterinar', name: 'VeterinarTerminPage', component: () => import('src/pages/VETERINAR/VeterinarTerminPage.vue'), meta: { requiresAuth: true, role: 'veterinar'} },
      { path: 'tretmani-veterinar', name: 'VeterinarTretmanPage', component: () => import('src/pages/VETERINAR/VeterinarTretmanPage.vue'), meta: { requiresAuth: true, role: 'veterinar'} }
    ]
  },

  // 📌 Administrator koristi `AdminLayout.vue` za svoje stranice
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      { path: '', name: 'AdminDashboard', component: () => import('src/pages/ADMINISTRATOR/AdminDashboard.vue'), meta: { requiresAuth: true, role: 'admin' } },
      { path: 'korisnici', name: 'AdminKorisniciPage', component: () => import('src/pages/ADMINISTRATOR/AdminKorisniciPage.vue'), meta: { requiresAuth: true, role: 'admin' } },
      { path: 'dogadaji', name: 'AdminDogadajiPage', component: () => import('src/pages/ADMINISTRATOR/AdminDogadajiPage.vue'), meta: { requiresAuth: true, role: 'admin' } },
      { path: 'veterinari', name: 'AdminVeterinariPage', component: () => import('src/pages/ADMINISTRATOR/AdminVeterinariPage.vue'), meta: { requiresAuth: true, role: 'admin' } },
    ]
  },

  // 📌 Error 404 stranica za nepostojeće rute
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/pages/ErrorNotFound.vue')
  }
];

export default routes;
