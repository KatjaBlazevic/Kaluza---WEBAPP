<template>
  <q-page class="veterinari-page">
    <!-- Hero sekcija -->
    <div class="hero-section flex flex-center">
      <div class="hero-content text-center">
        <h1 class="hero-title">Pronađi veterinara za svog ljubimca</h1>
      </div>
    </div>

    <!-- Search bar -->
    <div class="search-section q-px-xl">
      <div class="search-container">
        <q-input
          v-model="searchTerm"
          outlined
          placeholder="Pretraži veterinare..."
          class="search-input"
          @update:model-value="filterVeterinari"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Lista veterinara -->
    <div class="veterinari-list q-px-xl">
      <div class="row q-col-gutter-md">
        <div
          v-for="veterinar in displayedVeterinari"
          :key="veterinar.SIFRA_VETERINARA"
          class="col-12 col-md-6 col-lg-4"
        >
          <q-card class="veterinar-card" @click="selectVeterinar(veterinar)">
            <q-card-section>
              <div class="text-h6">{{ veterinar.ime_veterinara }} {{ veterinar.prezime_veterinara }}</div>
              <div class="text-subtitle2">{{ veterinar.specijalizacija_veterinara }}</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <p><q-icon name="location_on" /> {{ veterinar.lokacija_veterinara }}</p>
              <p><q-icon name="phone" /> {{ veterinar.kontakt_veterinara }}</p>
              <p><q-icon name="email" /> {{ veterinar.email_veterinara }}</p>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Gumb za prikaz više/manje -->
      <div class="text-center q-mt-md">
        <q-btn
        text-color="dark"
        :label="`Prikaži ${showAllVeterinari ? 'manje' : 'više'}`"
        @click="toggleVeterinari"
/>
      </div>
    </div>

   <!-- CTA sekcija -->
<div class="cta-section bg-secondary text-white q-py-lg">
  <div class="q-mx-auto q-px-md" style="max-width: 800px; text-align: center;">
    <div class="text-h5 q-mb-none">POGLEDAJ VETERINARE NA KARTI</div>
  </div>
</div>


    <!-- Mapa -->
    <div class="map-section q-px-xl">
      <div id="map" class="map"></div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';

const searchTerm = ref('');
const veterinari = ref([]);
const filteredVeterinari = ref([]);
const selectedVeterinar = ref(null);
const showAllVeterinari = ref(false);

const displayedVeterinari = computed(() =>
  showAllVeterinari.value
    ? filteredVeterinari.value
    : filteredVeterinari.value.slice(0, 3)
);

let map = null;
let markers = [];

const fetchVeterinari = async () => {
  try {
    const response = await fetch('http://localhost:3000/veterinari');
    const data = await response.json();
    veterinari.value = data;
    filteredVeterinari.value = data;
    nextTick(() => {
      updateMap();
    });
  } catch (err) {
    console.error('Greška pri dohvaćanju veterinara:', err);
  }
};

const filterVeterinari = () => {
  if (!searchTerm.value) {
    filteredVeterinari.value = veterinari.value;
    updateMap();
    return;
  }

  const term = searchTerm.value.toLowerCase();
  filteredVeterinari.value = veterinari.value.filter(v =>
    v.ime_veterinara.toLowerCase().includes(term) ||
    v.prezime_veterinara.toLowerCase().includes(term) ||
    v.lokacija_veterinara.toLowerCase().includes(term) ||
    v.specijalizacija_veterinara.toLowerCase().includes(term) ||
    v.email_veterinara.toLowerCase().includes(term) ||
    v.kontakt_veterinara.includes(term)
  );
  updateMap();
};

const toggleVeterinari = () => {
  showAllVeterinari.value = !showAllVeterinari.value;
  nextTick(updateMap);
};

const selectVeterinar = (veterinar) => {
  selectedVeterinar.value = veterinar;
  updateMap();
};

const initMap = () => {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 45.815, lng: 15.981 },
    zoom: 12,
  });
  updateMap();
};

const updateMap = () => {
  if (!map) return;

  markers.forEach(marker => marker.setMap(null));
  markers = [];

  const geocoder = new google.maps.Geocoder();
  const data = selectedVeterinar.value ? [selectedVeterinar.value] : displayedVeterinari.value;

  let bounds = new google.maps.LatLngBounds();

  data.forEach(veterinar => {
    geocoder.geocode({ address: veterinar.lokacija_veterinara }, (results, status) => {
      if (status === "OK") {
        const marker = new google.maps.Marker({
          map,
          position: results[0].geometry.location,
          title: `${veterinar.ime_veterinara} ${veterinar.prezime_veterinara}`
        });
        markers.push(marker);
        bounds.extend(results[0].geometry.location);
        map.fitBounds(bounds);
      }
    });
  });
};

const loadGoogleMaps = () => {
  if (window.google && window.google.maps) {
    initMap();
    return;
  }

  const script = document.createElement("script");
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCLvePuBOyBwYrwdeUGkY4pQSzsWcFcRs4';
  script.async = true;
  script.defer = true;
  script.onload = initMap;
  document.head.appendChild(script);
};

onMounted(() => {
  fetchVeterinari();
  loadGoogleMaps();
});
</script>

<style scoped>
.veterinari-page {
  padding: 0;
}

/* Hero sekcija */
.hero-section {
  height: 70vh;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8)),url('/hero_veterinari.jpg');
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
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.hero-subtitle {
  font-size: 1.5rem;
  opacity: 0.9;
  max-width: 800px;
  margin: 0 auto;
}

/* Search sekcija */
.search-section {
  max-width: 1200px;
  margin: 0 auto 2rem;
}

.search-container {
  padding: 0 1rem;
}

.search-input {
  background: white;
  border-radius: 0.5rem;
}

/* Lista veterinara */
.veterinari-list {
  max-width: 1200px;
  margin: 0 auto 3rem;
}

.veterinar-card {
  cursor: pointer;
  transition: transform 0.3s ease;
  height: 100%;
}

.veterinar-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.q-btn{
    background: white !important;
  border-radius: 25px !important;
  padding: 10px 30px !important;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
/* CTA sekcija */
.cta-section {
  padding: 2rem;
  margin-bottom: 2rem;
}

.cta-section .text-h5 {
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 0 1px 1px rgba(0,0,0,0.3);
}


/* Mapa */
.map-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem 3rem;
}

.map {
  height: 300px;
  width: 100%;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Responzivnost */
@media (max-width: 1023px) {
  .hero-title {
    font-size: 2.4rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }
}

@media (max-width: 600px) {
  .hero-section {
    height: 50vh;
    min-height: 300px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .map {
    height: 300px;
  }
}
</style>
