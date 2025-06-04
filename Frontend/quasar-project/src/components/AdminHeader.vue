<template>
  <q-header elevated class="bg-primary text-white">
    <q-toolbar class="header-toolbar">
      <!-- Lijevo - Logo -->
      <div class="header-left">
        <span class="text-h5">Admin Panel</span>
      </div>

      <!-- Sredina - Navigacija -->
      <div class="header-center gt-sm">
        <q-btn flat label="Korisnici" to="/admin/korisnici" class="text-button" />
        <q-btn flat label="Događaji" to="/admin/dogadaji" class="text-button" />
        <q-btn flat label="Veterinari" to="/admin/veterinari" class="text-button" />
      </div>

      <!-- Desno - Odjava -->
      <div class="header-right gt-sm">
        <q-btn flat icon="logout" label="Odjava" @click="logout" class="text-button" />
      </div>

      <!-- Mobilni meni ikona -->
      <q-btn
        flat
        round
        dense
        icon="menu"
        class="lt-md"
        @click="toggleLeftDrawer"
        aria-label="Glavni meni"
      />
    </q-toolbar>

    <!-- Mobilni drawer meni -->
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
            :key="link.to"
            clickable
            v-ripple
            :to="link.to"
            class="text-white q-my-xs"
            active-class="active-menu-item"
            @click="toggleLeftDrawer"
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

const router = useRouter();
const leftDrawerOpen = ref(false);

const links = [
  { label: 'Korisnici', to: '/admin/korisnici' },
  { label: 'Događaji', to: '/admin/dogadaji' },
  { label: 'Veterinari', to: '/admin/veterinari' },
  { label: 'Odjava', action: () => logout() }
];

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

function logout() {
  fetch("http://localhost:3000/logout", { method: "POST", credentials: "include" })
    .then(() => router.push("/prijava"))
    .catch((err) => console.error("❌ Greška pri odjavi:", err));
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
    padding: 0 20px;
    grid-template-columns: auto 1fr auto;
  }

  .header-center, .header-right {
    display: none;
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
