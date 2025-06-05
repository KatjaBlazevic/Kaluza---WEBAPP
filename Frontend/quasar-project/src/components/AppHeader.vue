<template>
  <q-header elevated class="bg-primary text-white">
    <q-toolbar class="header-toolbar">
      <div class="header-left">
        <span class="text-h5">Pets&Care</span>
      </div>

      <div class="header-center gt-sm">
        <q-btn flat label="Početna" to="/" class="text-button" />
        <q-btn flat label="O nama" to="/about" class="text-button" />
        <q-btn flat label="Događaji" to="/events" class="text-button" />
        <q-btn flat label="Veterinari" to="/vets" class="text-button" />
        <q-btn flat label="Kontakt" to="/contact" class="text-button" />
      </div>

      <div class="header-right gt-sm">
        <q-btn
          flat
          label="Moj profil"
          :to="userStore.role === 'veterinar' ? '/profile-veterinar' : userStore.role === 'admin' ? '/admin' : '/profile'"
          class="text-button"
        />
        <q-btn
          v-if="userStore.isAuthenticated"
          flat
          icon="logout"
          label="Odjava"
          @click="logout"
          class="text-button"
        />
      </div>

      <q-btn
        flat
        round
        dense
        icon="menu"
        class="lt-md q-ml-auto"
        @click="toggleLeftDrawer"
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
            :key="link.to || link.label"
            clickable
            v-ripple
            :to="link.to"
            @click="link.action ? link.action() : toggleLeftDrawer()"
            class="text-white q-my-xs"
            active-class="active-menu-item"
          >
            <q-item-section>{{ link.label }}</q-item-section>
          </q-item>

          <q-separator color="white" class="q-my-sm" />
          <q-item
            clickable
            v-ripple
            :to="userStore.role === 'veterinar' ? '/profile-veterinar' : userStore.role === 'admin' ? '/admin' : '/profile'"
            class="text-white q-my-xs"
            active-class="active-menu-item"
            @click="toggleLeftDrawer"
          >
            <q-item-section>Moj profil</q-item-section>
          </q-item>

          <q-item
            v-if="userStore.isAuthenticated"
            clickable
            v-ripple
            @click="logout"
            class="text-white q-my-xs"
          >
            <q-item-section>Odjava</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>
  </q-header>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';
import { useUserStore } from '../stores/user';

const router = useRouter();
const userStore = useUserStore();

const leftDrawerOpen = ref(false);

const getUserRole = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    userStore.clearUser();
    return null;
  }

  try {
    const decoded = jwtDecode(token);
    userStore.setUser({ role: decoded.role });
    return decoded.role || null;
  } catch (err) {
    console.error('Greška pri dekodiranju tokena ili postavljanju role:', err);
    userStore.clearUser();
    return null;
  }
};

getUserRole();


const links = [
  { label: 'Početna', to: '/' },
  { label: 'O nama', to: '/about' },
  { label: 'Događaji', to: '/events' },
  { label: 'Veterinari', to: '/vets' },
  { label: 'Kontakt', to: '/contact' },
];

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const logout = () => {
  userStore.clearUser();
  router.push('/prijava');
  if (leftDrawerOpen.value) {
    leftDrawerOpen.value = false;
  }
};
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

.q-drawer {
  background-color: var(--q-primary) !important;
}

.active-menu-item {
  background-color: rgba(255, 255, 255, 0.1);
}

@media (max-width: 1023px) {
  .header-toolbar {
    padding: 0 20px;
    grid-template-columns: auto 1fr auto;
  }

  .header-center, .header-right {
    display: none;
  }

  .lt-md {
    order: 3;
  }

  .header-left {
    order: 1;
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
