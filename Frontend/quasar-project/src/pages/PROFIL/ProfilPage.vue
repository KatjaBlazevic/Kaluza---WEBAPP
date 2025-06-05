<template>
  <q-page class="profile-page">
    <div v-if="loading" class="text-center q-pa-md">
      Učitavanje podataka...
    </div>

    <div v-else>
      <!-- Hero sekcija -->
      <div class="hero-section flex flex-center">
        <div class="hero-content text-center text-white">
          <h1 class="hero-title">
            Dobrodošao/la, {{ userStore.userFullName }}
          </h1>
          <div class="hero-buttons q-mt-md">
            <q-btn
              unelevated
              label="Uredi profil"
              color="white"
              text-color="dark"
              size="lg"
              class="uredi-profil-btn q-mr-sm"
              to="/uredi-profil"
            />
            <q-btn
              unelevated
              label="Pregled ljubimaca"
              color="white"
              text-color="dark"
              size="lg"
              class="uredi-profil-btn"
              to="/pregled-ljubimaca"
            />
          </div>
        </div>
      </div>

      <!-- Glavni sadržaj -->
      <div class="main-content">
        <div class="row justify-center q-gutter-xl q-mb-xl">
          <div class="info-card">
            <q-icon name="pets" size="lg" class="section-icon" />
            <h2 class="text-h5 q-mt-sm q-mb-sm text-dark">GALERIJA</h2>
            <q-btn
              unelevated
              label="Pogledaj galeriju"
              color="white"
              text-color="dark"
              to="/galerija"
              class="full-width card-btn"
            />
          </div>

          <div class="info-card">
            <q-icon name="group_add" size="lg" class="section-icon" />
            <h2 class="text-h5 q-mt-sm q-mb-sm text-dark">PODSJETNICI</h2>
            <q-btn
              unelevated
              label="Pogledaj podsjetnike"
              color="white"
              text-color="dark"
              to="/podsjetnici"
              class="full-width card-btn"
            />
          </div>

          <div class="info-card">
            <q-icon name="event" size="lg" class="section-icon" />
            <h2 class="text-h5 q-mt-sm q-mb-sm text-dark">DNEVNIK</h2>
            <q-btn
              unelevated
              label="Pogledaj dnevnik"
              color="white"
              text-color="dark"
              to="/dnevnik"
              class="full-width card-btn"
            />
          </div>

            <div class="info-card">
            <q-icon name="event" size="lg" class="section-icon" />
            <h2 class="text-h5 q-mt-sm q-mb-sm text-dark">TERMINI</h2>
            <q-btn
              unelevated
              label="Pogledaj termine"
              color="white"
              text-color="dark"
              to="/termin"
              class="full-width card-btn"
            />
            </div>
          <div class="info-card">
            <q-icon name="event" size="lg" class="section-icon" />
            <h2 class="text-h5 q-mt-sm q-mb-sm text-dark">DOKUMENTI</h2>
            <q-btn
              unelevated
              label="Pogledaj dokumente"
              color="white"
              text-color="dark"
              to="/dokumenti"
              class="full-width card-btn"
            />
          </div>
        </div>

        <!-- Gumb za odjavu -->
        <div class="text-center q-mt-xl">
          <q-btn
            unelevated
            label="ODJAVI SE"
            color="accent"
            size="md"
            class="logout-btn"
            @click="logout"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user';

const router = useRouter()
const loading = ref(true)
const userStore = useUserStore()

async function fetchProfile() {
  try {
    const res = await fetch('http://localhost:3000/profile', { credentials: 'include' });

    if (!res.ok) {
      router.push('/prijava'); // Ako nema sesije, preusmjeri na prijavu
      return;
    }

    const data = await res.json();
    userStore.setUser(data); // Postavi korisnika u store
  } catch (err) {
    console.error('Greška prilikom dohvata profila:', err);
    router.push('/prijava');
  } finally {
    loading.value = false;
  }
}


async function logout() {
  try {
    await fetch('http://localhost:3000/logout', {
      method: 'POST',
      credentials: 'include'
    });
    userStore.clearUser();
  } catch (err) {
    console.error('Greška prilikom odjave:', err);
  }
  router.push('/prijava');
}

onMounted(fetchProfile);
</script>

<style scoped>
.profile-page {
  background-color: white;
}

.hero-section {
  height: 70vh;
  background: linear-gradient(
      rgba(0, 0, 0, 0.6),
      rgba(0, 0, 0, 0.9)
    ),
    url('hero_pocetna.avif');
  background-size: cover;
  background-position: center;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 3rem;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: bold;
  line-height: 1.7;
  margin-right: 20px;
  margin-left: 20px;
}

.hero-buttons {
  display: flex;
  justify-content: center;
}

.uredi-profil-btn {
  background: white !important;
  border-radius: 15px !important;
  padding: 10px 30px !important;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.main-content {
  padding: 40px 10%;
  margin-top: -50px;
  position: relative;
  z-index: 1;
  background-color: white;
}

.info-card {
  background: var(--q-secondary);
  border-radius: 15px;
  padding: 30px;
  width: 300px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.card-btn {
  border-radius: 15px !important;
  font-weight: bold;
}

.logout-btn {
  border-radius: 10px;
  padding: 10px 30px;
  font-weight: bold;
}
</style>
