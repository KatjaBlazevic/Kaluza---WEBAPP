<template>
  <q-page class="veterinar-termini-page">
    <div class="hero-section flex flex-center">
      <div class="hero-content text-center text-white">
        <h1 class="hero-title">Upravljanje Terminima</h1>
        <p class="text-subtitle1 q-mt-md">Pregledajte i upravljajte zakazanim terminima</p>
      </div>
    </div>

    <div class="main-content">
      <div class="q-pa-md">
        <q-input outlined v-model="searchQuery" placeholder="Pretraži termine po ljubimcu, vlasniku, datumu ili statusu..." class="search-input">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div v-if="filteredTermini.length > 0">
        <div class="termini-section">
          <div class="row justify-center q-gutter-md">
            <div v-for="t in filteredTermini"
              :key="t.SIFRA_TERMINA"
              class="termin-card col-xs-12 col-sm-6 col-md-4">
              <q-card-section class="text-left">
                <h3 class="termin-title flex items-center">
                  <q-icon name="pets" class="q-mr-sm" />
                  Ljubimac: {{ t.ime_ljubimca }}
                </h3>

                <p class="termin-details q-mt-xs text-grey-8">
                  <q-icon name="person" class="q-mr-xs" /> Vlasnik: {{ t.ime_korisnika }} {{ t.prezime_korisnika }}
                </p>
                <p class="termin-details text-grey-8">
                  <q-icon name="email" class="q-mr-xs" /> Kontakt: {{ t.email_korisnika }}
                </p>
                <p class="termin-details text-grey-8">
                  <q-icon name="phone" class="q-mr-xs" /> Telefon: {{ t.broj_telefona_korisnika }}
                </p>

                <p class="termin-datetime flex items-center q-mt-sm">
                  <q-icon name="calendar_today" class="q-mr-sm" />
                  {{ formatDate(t.datum_termina) }} u {{ formatTime(t.vrijeme_termina) }}
                </p>

                <p class="termin-description q-mt-sm text-grey-8">
                  Simptomi: {{ t.simptomi_ljubimca }}
                </p>
                <p v-if="t.razlog_posjete" class="termin-description q-mt-xs text-grey-8">
                  Razlog posjete: {{ t.razlog_posjete }}
                </p>

                <q-badge :color="getStatusColor(t.status_termina)" class="q-mt-md">{{ t.status_termina }}</q-badge>

                <div class="termin-actions q-mt-md flex justify-around">
                  <q-btn flat dense icon="check_circle" label="Potvrdi" color="positive" @click="updateTerminStatus(t.SIFRA_TERMINA, 'Confirmed')" v-if="t.status_termina === 'Pending'"/>
                  <q-btn flat dense icon="cancel" label="Otkaži" color="negative" @click="updateTerminStatus(t.SIFRA_TERMINA, 'Canceled')" v-if="t.status_termina !== 'Canceled' && t.status_termina !== 'Completed'"/>
                  <q-btn flat dense icon="task_alt" label="Završi" color="primary" @click="updateTerminStatus(t.SIFRA_TERMINA, 'Completed')" v-if="t.status_termina === 'Confirmed'"/>
                </div>
              </q-card-section>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center q-pa-md">
        <p class="text-h6 text-grey-7">Nema pronađenih termina.</p>
        <p class="text-grey-6">Trenutno nema zakazanih ili aktivnih termina za vas.</p>
      </div>
    </div>
  </q-page>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const $q = useQuasar();
const router = useRouter();
const userStore = useUserStore();

const termini = ref([]);
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

// Filtriranje termina
const filteredTermini = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return termini.value.filter(t =>
    (t.ime_ljubimca && t.ime_ljubimca.toLowerCase().includes(query)) ||
    (t.ime_korisnika && t.ime_korisnika.toLowerCase().includes(query)) ||
    (t.prezime_korisnika && t.prezime_korisnika.toLowerCase().includes(query)) ||
    (t.datum_termina && formatDate(t.datum_termina).includes(query)) ||
    (t.status_termina && t.status_termina.toLowerCase().includes(query)) ||
    (t.simptomi_ljubimca && t.simptomi_ljubimca.toLowerCase().includes(query)) ||
    (t.razlog_posjete && t.razlog_posjete.toLowerCase().includes(query)) ||
    (t.broj_telefona_korisnika && t.broj_telefona_korisnika.toLowerCase().includes(query))
  );
});

// Dohvat termina za veterinara
async function fetchTerminiZaVeterinara() {
  try {
    const response = await fetch("http://localhost:3000/termin", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      console.error("Greška pri dohvaćanju termina");
      return;
    }

    const data = await response.json();
    console.log("Dohvaćeni termini:", data); // Debugging

    termini.value = data;

  } catch (err) {
    console.error("Greška pri dohvaćanju termina:", err);
  }
  console.log("UserStore podaci:", JSON.stringify(userStore.$state, null, 2));
}

// Ažuriranje statusa termina
async function updateTerminStatus(terminId, newStatus) {
  try {
    const payload = {
      status_termina: newStatus,
      SIFRA_VETERINARA: userStore.SIFRA_VETERINARA
    };

    console.log("Šaljem zahtjev za ažuriranje:", payload); // Debugging

    const response = await fetch(`http://localhost:3000/termini/${terminId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Status uspješno ažuriran:", data.novi_status);
      fetchTerminiZaVeterinara();
    } else {
      console.error("Greška pri ažuriranju termina:", await response.text());
    }
  } catch (error) {
    console.error("Greška pri ažuriranju termina:", error);
  }
}

// Odabir boje statusa termina
function getStatusColor(status) {
  switch (status) {
    case 'Pending': return 'orange';
    case 'Confirmed': return 'positive';
    case 'Canceled': return 'negative';
    case 'Completed': return 'blue-grey-6';
    default: return 'grey';
  }
}

onMounted(() => {
  fetchTerminiZaVeterinara();
});
</script>



<style scoped>
.termini-page {
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

.add-termin-btn { /* Promijenjen naziv klase */
  background: white !important;
  border-radius: 15px !important;
  padding: 10px 20px !important;
  font-weight: bold;
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
  margin-top: -60px;
}

.termini-section { /* Promijenjen naziv klase */
  background: var(--q-secondary); /* Koristite sekundarnu boju vaše teme */
  border-radius: 15px;
  padding: 40px;
  margin-bottom: -50px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.termin-card { /* Promijenjen naziv klase */
  background: white;
  border-radius: 15px;
  padding: 20px;
  width: 350px;
  text-align: left;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; /* Dodano za hover efekt */
}

.termin-card:hover { /* Dodano za hover efekt */
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.termin-title { /* Promijenjen naziv klase */
  font-size: 1.3rem;
  font-weight: bold;
  line-height: 1.7;
  color: var(--q-dark);
}

.termin-datetime, .termin-details, .termin-description { /* Promijenjen naziv klase */
  font-size: 1em;
  color: gray;
}

.termin-actions .q-btn { /* Promijenjen naziv klase */
  min-width: unset;
}

/* Responsivni stilovi */
@media (max-width: 1023px) {
  .hero-title {
    font-size: 2rem;
  }

  .main-content {
    padding: 60px 5%;
  }

  .termini-section {
    padding: 30px;
  }

  .termin-card {
    width: 100%;
    max-width: 350px;
    margin-bottom: 20px;
  }
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 1.8rem;
  }

  .main-content {
    padding: 50px 20px;
    margin-top: -30px;
    border-radius: 20px 20px 0 0;
  }

  .termini-section {
    padding: 20px;
  }
}
</style>
