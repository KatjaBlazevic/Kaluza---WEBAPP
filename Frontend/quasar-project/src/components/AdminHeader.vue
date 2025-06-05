<template>
  <q-header elevated class="bg-primary text-white">
    <q-toolbar class="header-toolbar">
      <div class="header-left">
        <span class="text-h5">Admin Panel</span>
      </div>

      <div class="header-center gt-sm">
        <q-btn flat label="Dashboard" to="/admin" class="text-button" />
        <q-btn flat label="Korisnici" to="/admin/korisnici" class="text-button" />
        <q-btn flat label="Događaji" to="/admin/dogadaji" class="text-button" />
        <q-btn flat label="Veterinari" to="/admin/veterinari" class="text-button" />
      </div>

      <div class="header-right gt-sm">
        <q-btn flat icon="logout" label="Odjava" @click="logout" class="text-button" />
      </div>

      <q-btn
        flat
        round
        dense
        icon="menu"
        class="lt-md q-ml-auto" @click="toggleLeftDrawer"
        aria-label="Glavni meni"
      />
    </q-toolbar>

    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      bordered
      class="lt-md bg-primary text-white"
      :width="250"
    >
      <q-scroll-area class="fit">
        <q-list>
          <q-item-label header class="text-white q-py-md">
            Navigacija
          </q-item-label>

          <q-item
            v-for="link in links"
            :key="link.to || link.label" clickable
            v-ripple
            :to="link.to"
            @click="link.action ? link.action() : toggleLeftDrawer()" class2="text-white q-my-xs"
            active-class="active-menu-item"
          >
            <q-item-section>{{ link.label }}</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>
  </q-header>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from "vue-router";
import { useUserStore } from 'src/stores/user'; // Uvezi Pinia store

const router = useRouter();
const userStore = useUserStore(); // Inicijaliziraj user store

const leftDrawerOpen = ref(false);

const links = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Korisnici', to: '/admin/korisnici' },
  { label: 'Događaji', to: '/admin/dogadaji' },
  { label: 'Veterinari', to: '/admin/veterinari' },
  { label: 'Odjava', action: () => logout() }
];

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

function logout() {
  userStore.clearUser(); // Koristimo Pinia store za odjavu
  router.push("/prijava");
  // Zatvori drawer nakon odjave ako je otvoren
  if (leftDrawerOpen.value) {
    leftDrawerOpen.value = false;
  }
}
</script>

<style scoped>
.header-toolbar {
  padding: 0 50px;
  height: 70px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  align-items: center;
}

.header-left {
  justify-self: start;
}

.header-center {
  display: flex;
  gap: 12px;
  justify-self: center;
}

.header-right {
  display: flex;
  justify-self: end;
}

.q-btn {
  text-transform: capitalize;
  font-weight: 500;
  letter-spacing: 0.5px;
  padding: 0 12px;
}

/* Mobilni meni stilovi */
.q-drawer {
  background-color: var(--q-primary) !important;
}

.active-menu-item {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Responsivne prilagodbe */
@media (max-width: 1023px) {
  .header-toolbar {
    /* Promjena grid template columns na manjim ekranima */
    /* Automatski će gurnuti zadnji element skroz desno ako je ostali prostor slobodan */
    grid-template-columns: auto 1fr auto; /* Logo, prazan prostor, hamburger */
    padding: 0 20px;
  }

  /* Osigurajte da mobilni meni gumb bude zadnji vizualno */
  .lt-md {
    order: 3; /* Postavlja hamburger gumb da bude zadnji element u redu */
  }

  .header-left {
    order: 1; /* Postavlja logo da bude prvi */
  }

  .header-center, .header-right {
    display: none; /* Skriva desktop navigaciju */
  }
}

@media (max-width: 600px) {
  .header-toolbar {
    padding: 0 12px;
  }

  .header-left span {
    font-size: 1.25rem;
  }
}
</style>
