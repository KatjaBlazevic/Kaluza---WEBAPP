<template>
  <q-header elevated class="bg-primary text-white">
    <q-toolbar class="header-toolbar">
      <!-- Lijevo - Logo -->
      <div class="header-left">
        <span class="text-h5">Pets&Care</span>
      </div>

      <!-- Sredina - Navigacija -->
      <div class="header-center gt-sm">
        <q-btn flat label="Početna" to="/" class="text-button" />
        <q-btn flat label="O nama" to="/about" class="text-button" />
        <q-btn flat label="Događaji" to="/events" class="text-button" />
        <q-btn flat label="Veterinari" to="/vets" class="text-button" />
        <q-btn flat label="Kontakt" to="/contact" class="text-button" />
      </div>

      <!-- Desno - Profil -->
      <div class="header-right gt-sm">
        <q-btn flat label="Moj profil" to="/profile" class="text-button" />
      </div>

      <!-- Mobilni meni -->
      <q-btn flat round dense icon="menu" class="lt-md" @click="toggleLeftDrawer" />
    </q-toolbar>

    <!-- Drawer za mobilni meni -->
    <q-drawer v-model="leftDrawerOpen" side="left" bordered>
      <q-list>
        <q-item clickable v-ripple to="/">
          <q-item-section>Početna</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/about">
          <q-item-section>O nama</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/events">
          <q-item-section>Događaji</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/vets">
          <q-item-section>Veterinari</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/contact">
          <q-item-section>Kontakt</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/profile">
          <q-item-section>Moj profil</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
  </q-header>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const leftDrawerOpen = ref(false)

    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  }
}
</script>

<style scoped>
.header-toolbar {
  padding: 0 50px;
  height: 70px;
  display: flex;
  justify-content: space-between;
  position: relative;
}

.header-left {
  flex: 1;
  display: flex;
  align-items: center;
}

.header-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.q-btn {
  text-transform: capitalize;
  min-width: max-content;
}

/* Responsivnost */
@media (max-width: 1023px) {
  .header-center, .header-right {
    display: none;
  }
}
</style>
