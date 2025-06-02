<template>
  <q-page class="korisnik-tretmani-page">
    <div class="hero-section flex flex-center">
      <div class="hero-content text-center text-white">
        <h1 class="hero-title">Moji Tretmani</h1>
        <p class="text-subtitle1 q-mt-md">Pregledajte sve tretmane vaših ljubimaca</p>
      </div>
    </div>

    <div class="main-content">
      <div class="q-pa-md">
        <q-input outlined v-model="searchQuery" placeholder="Pretraži tretmane po ljubimcu, dijagnozi ili terapiji..." class="search-input">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div v-if="filteredTretmani.length > 0">
        <div class="tretmani-section">
          <div class="row justify-center q-gutter-md">
            <div v-for="t in filteredTretmani"
              :key="t.SIFRA_TRETMANA"
              class="tretman-card col-xs-12 col-sm-6 col-md-4">
              <q-card-section class="text-left">
                <h3 class="tretman-title flex items-center">
                  <q-icon name="pets" class="q-mr-sm" />
                  Ljubimac: {{ t.ime_ljubimca }}
                </h3>

                <p class="tretman-details q-mt-xs text-grey-8">
                  <q-icon name="calendar_today" class="q-mr-xs" /> Datum liječenja: {{ formatDate(t.datum_lijecenja) }}
                </p>
                <p class="tretman-details text-grey-8">
                  <q-icon name="schedule" class="q-mr-xs" /> Vrijeme liječenja: {{ formatTime(t.vrijeme_lijecenja) }}
                </p>

                <p class="tretman-description q-mt-sm text-grey-8">
                  <q-icon name="medical_services" class="q-mr-xs" /> Dijagnoza: {{ t.bolest_ljubimca }}
                </p>
                <p class="tretman-description q-mt-xs text-grey-8">
                  <q-icon name="medication" class="q-mr-xs" /> Terapija: {{ t.lijecenje_ljubimca }}
                </p>
              </q-card-section>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center q-pa-md">
        <p class="text-h6 text-grey-7">Nema pronađenih tretmana.</p>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const tretmani = ref([]);
const searchQuery = ref('');

// Formatiranje datuma u MM.DD.YYYY
function formatDate(isoDate) {
  const date = new Date(isoDate);
  return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}.${date.getFullYear()}`;
}

// Formatiranje vremena u HH.MM
function formatTime(timeString) {
  const [hours, minutes] = timeString.split(':');
  return `${hours}.${minutes}`;
}

// Filtriranje tretmana
const filteredTretmani = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return tretmani.value.filter(t =>
    (t.ime_ljubimca && t.ime_ljubimca.toLowerCase().includes(query)) ||
    (t.bolest_ljubimca && t.bolest_ljubimca.toLowerCase().includes(query)) ||
    (t.lijecenje_ljubimca && t.lijecenje_ljubimca.toLowerCase().includes(query))
  );
});

// Dohvat tretmana za korisnika
async function fetchTretmaniKorisnika() {
  if (!userStore.SIFRA_KORISNIKA) {
    console.error("Greška: SIFRA_KORISNIKA je null!");
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/tretmani/korisnik/${userStore.SIFRA_KORISNIKA}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      console.error("Greška pri dohvaćanju tretmana:", await response.text());
      return;
    }

    const data = await response.json();
    console.log("Dohvaćeni tretmani:", data);
    tretmani.value = data;

  } catch (err) {
    console.error("Greška pri dohvaćanju tretmana:", err);
  }
}


onMounted(() => {
  fetchTretmaniKorisnika();
});
</script>

<style scoped>
.korisnik-tretmani-page {
  background-color: white;
}

.hero-section {
  height: 70vh;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1)), url('/hero_pocetna.avif');
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
  margin-bottom: 1rem;
}

.main-content {
  padding: 80px 10%;
  margin-top: -50px;
  position: relative;
  z-index: 1;
  background-color: white;
}

.search-input {
  margin-bottom: 30px;
  border-radius: 15px;
}

.tretmani-section {
  background: var(--q-secondary);
  border-radius: 15px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.tretman-card {
  background: white;
  border-radius: 15px;
  padding: 20px;
  width: 350px;
  text-align: left;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.tretman-title {
  font-size: 1.3rem;
  font-weight: bold;
  line-height: 1.7;
}

.tretman-details, .tretman-description {
  font-size: 1em;
  color: gray;
}

@media (max-width: 1023px) {
  .hero-title {
    font-size: 2rem;
  }

  .main-content {
    padding: 60px 5%;
  }

  .tretmani-section {
    padding: 30px;
  }

  .tretman-card {
    width: 100%;
    max-width: 350px;
    margin-bottom: 20px;
  }
}
</style>
