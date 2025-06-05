<template>
  <q-page class="profile-page">
    <div v-if="loading" class="text-center q-pa-md">
      Učitavanje podataka...
    </div>

    <div v-else>
      <div class="hero-section flex flex-center">
        <div class="hero-content text-center text-white">
          <h1 class="hero-title">
            Dobrodošao/la, {{ userStore.userFullName }}
          </h1>
        </div>
      </div>

      <div class="main-content">
        <div class="row justify-center q-gutter-xl q-mb-xl">
          <div class="info-card">
            <q-icon name="event" size="lg" class="section-icon" />
            <h2 class="text-h5 q-mt-sm q-mb-sm text-dark">TERMINI</h2>
            <q-btn
              unelevated
              label="Pogledaj termine"
              color="white"
              text-color="dark"
              to="/termin-veterinar"
              class="full-width card-btn"
            />
          </div>

          <div class="info-card">
            <q-icon name="healing" size="lg" class="section-icon" />
            <h2 class="text-h5 q-mt-sm q-mb-sm text-dark">TRETMANI</h2>
            <q-btn
              unelevated
              label="Pogledaj tretmane"
              color="white"
              text-color="dark"
              to="/tretmani-veterinar"
              class="full-width card-btn"
            />
          </div>
        </div>

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
  const token = userStore.token;

  if (!token) {
    router.push('/prijava');
    loading.value = false;
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      console.error('Greška pri dohvatu profila:', res.status, res.statusText);
      userStore.clearUser();
      router.push('/prijava');
      return;
    }

    const data = await res.json();
    // ✅ KLJUČNA PROMJENA OVDJE:
    // Backend ruta '/profile' vraća id, ime, prezime, role direktno u 'data' objektu.
    // Stoga, proslijedite 'data' direktno u setUser zajedno s postojećim tokenom.
    userStore.setUser({
        id: data.id,
        ime: data.ime,
        prezime: data.prezime,
        role: data.role,
        token: token // Proslijedite token koji je već pri ruci
    });
  } catch (err) {
    console.error('Greška prilikom dohvata profila:', err);
    userStore.clearUser();
    router.push('/prijava');
  } finally {
    loading.value = false;
  }
}

async function logout() {
  try {
    await fetch('http://localhost:3000/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    userStore.clearUser();
  } catch (err) {
    console.error('Greška prilikom odjave:', err);
  }
  router.push('/prijava');
}

onMounted(() => {
  if (!userStore.token) {
    router.push('/prijava');
    loading.value = false;
  } else {
    fetchProfile();
  }
});
</script>

<style scoped>
/* Vaš postojeći CSS */
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
