<template>
  <q-page class="termini-page">
    <div class="hero-section flex flex-center">
      <div class="hero-content text-center text-white">
        <h1 class="hero-title">Moji Termini</h1>
        <q-btn unelevated label="ZAKAŽI NOVI TERMIN" color="white" text-color="dark" size="lg" class="add-termin-btn q-mt-md" @click="openScheduleDialog" />
      </div>
    </div>

    <div class="main-content">
      <div class="q-pa-md">
        <q-input outlined v-model="searchQuery" placeholder="Pretraži termine po ljubimcu, veterinaru, datumu ili statusu..." class="search-input">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div v-if="filteredTermini.length > 0">
        <div class="termini-section">
          <div class="row justify-center q-gutter-md">
            <div v-for="t in (showAll ? filteredTermini : filteredTermini.slice(0, 3))"
              :key="t.SIFRA_TERMINA"
              class="termin-card col-xs-12 col-sm-6 col-md-4">
              <q-card-section class="text-left">
                <h3 class="termin-title flex items-center">
                  <q-icon name="event" class="q-mr-sm" />
                  Termin za: {{ t.ime_ljubimca }}
                </h3>

                <p class="termin-details q-mt-xs text-grey-8">
                  <q-icon name="person" class="q-mr-xs" /> Veterinar: **{{ t.ime_veterinara }}**
                </p>

                <p class="termin-datetime flex items-center q-mt-sm">
                  <q-icon name="calendar_today" class="q-mr-sm" />
                  {{ t.datum_termina }} u {{ t.vrijeme_termina }}
                </p>

                <p class="termin-description q-mt-sm text-grey-8">
                  **Simptomi:** {{ t.simptomi_ljubimca }}
                </p>
                <p v-if="t.razlog_posjete" class="termin-description q-mt-xs text-grey-8">
                  **Razlog posjete:** {{ t.razlog_posjete }}
                </p>

                <q-badge :color="getStatusColor(t.status_termina)" class="q-mt-md">{{ t.status_termina }}</q-badge>

                <div class="termin-actions q-mt-md flex justify-around">
                  <q-btn flat dense icon="cancel" label="Otkaži" color="negative"
                    @click="cancelTermin(t.SIFRA_TERMINA)" v-if="t.status_termina === 'Pending'" />
                  </div>
              </q-card-section>
            </div>
          </div>
        </div>

        <div class="q-mt-lg text-center">
          <q-btn v-if="filteredTermini.length > 3" @click="toggleShowAll" flat color="primary">
            {{ showAll ? 'Prikaži manje' : 'Prikaži više' }}
          </q-btn>
        </div>
      </div>
      <div v-else class="text-center q-pa-md">
        <p class="text-h6 text-grey-7">Nema pronađenih termina.</p>
        <p class="text-grey-6">Zakažite novi termin ili prilagodite pretragu.</p>
      </div>
    </div>

    <q-dialog v-model="showScheduleDialog">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Zakaži Novi Termin</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="submitTermin" class="q-gutter-md">
            <q-select
              outlined
              v-model="selectedLjubimac"
              :options="ljubimciOptions"
              label="Odaberi ljubimca"
              emit-value
              map-options
              :rules="[val => !!val || 'Molimo odaberite ljubimca']"
            />

            <q-select
              outlined
              v-model="selectedVeterinar"
              :options="veterinariOptions"
              label="Odaberi veterinara"
              emit-value
              map-options
              :rules="[val => !!val || 'Molimo odaberite veterinara']"
            />

            <q-input
              outlined
              v-model="termin.datum_termina"
              label="Datum termina"
              type="date"
              :rules="[val => !!val || 'Molimo odaberite datum']"
            />

            <q-input
              outlined
              v-model="termin.vrijeme_termina"
              label="Vrijeme termina"
              type="time"
              :rules="[val => !!val || 'Molimo odaberite vrijeme']"
            />

            <q-input
              outlined
              v-model="termin.simptomi_ljubimca"
              label="Simptomi ljubimca"
              type="textarea"
              rows="3"
              :rules="[val => !!val || 'Molimo opišite simptome']"
            />

            <q-input
              outlined
              v-model="termin.razlog_posjete"
              label="Razlog posjete (opcionalno)"
              type="textarea"
              rows="2"
            />

            <div class="flex justify-center q-mt-lg">
              <q-btn label="Zakaži Termin" type="submit" color="primary" unelevated size="lg"/>
              <q-btn label="Odustani" color="negative" flat class="q-ml-sm" @click="showScheduleDialog = false" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const router = useRouter();

const termin = ref({
  datum_termina: '',
  vrijeme_termina: '',
  simptomi_ljubimca: '',
  razlog_posjete: '',
});

const selectedLjubimac = ref(null);
const ljubimciOptions = ref([]);

const selectedVeterinar = ref(null);
const veterinariOptions = ref([]);

const korisnikoviTermini = ref([]);
const searchQuery = ref('');
const showAll = ref(false); // Za prikaz više/manje kartica termina
const showScheduleDialog = ref(false); // Kontrola vidljivosti dialoga za zakazivanje

// Filtriranje termina na temelju unosa u tražilicu
const filteredTermini = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return korisnikoviTermini.value.filter(t =>
    t.ime_ljubimca.toLowerCase().includes(query) ||
    t.ime_veterinara.toLowerCase().includes(query) ||
    t.datum_termina.includes(query) ||
    t.status_termina.toLowerCase().includes(query) ||
    t.simptomi_ljubimca.toLowerCase().includes(query) ||
    (t.razlog_posjete && t.razlog_posjete.toLowerCase().includes(query))
  );
});

// Otvaranje dialoga za zakazivanje
function openScheduleDialog() {
  showScheduleDialog.value = true;
  // Opcionalno, resetirajte formu svaki put kada se dialog otvori
  termin.value = {
    datum_termina: '',
    vrijeme_termina: '',
    simptomi_ljubimca: '',
    razlog_posjete: '',
  };
  selectedLjubimac.value = null;
  selectedVeterinar.value = null;
}

// Funkcija za dohvat ljubimaca korisnika
async function fetchLjubimci() {
  try {
    const response = await fetch('http://localhost:3000/api/moji-ljubimci', {
      method: 'GET',
      credentials: 'include'
    });
    if (response.ok) {
      const data = await response.json();
      ljubimciOptions.value = data.map(lj => ({
        label: lj.ime_ljubimca,
        value: lj.SIFRA_LJUBIMCA
      }));
    } else if (response.status === 401) {
      $q.notify({
        type: 'negative',
        message: 'Niste prijavljeni. Molimo prijavite se.'
      });
      router.push('/prijava');
    } else {
      $q.notify({
        type: 'negative',
        message: 'Greška pri dohvaćanju ljubimaca: ' + (await response.text())
      });
    }
  } catch (error) {
    console.error('Greška pri dohvaćanju ljubimaca:', error);
    $q.notify({
      type: 'negative',
      message: 'Došlo je do pogreške prilikom dohvaćanja ljubimaca.'
    });
  }
}

// Funkcija za dohvat veterinara
async function fetchVeterinari() {
  try {
    const response = await fetch('http://localhost:3000/veterinari');
    if (response.ok) {
      const data = await response.json();
      veterinariOptions.value = data.map(vet => ({
        label: `${vet.ime_veterinara} ${vet.prezime_veterinara}`,
        value: vet.SIFRA_VETERINARA
      }));
    } else {
      $q.notify({
        type: 'negative',
        message: 'Greška pri dohvaćanju veterinara: ' + (await response.text())
      });
    }
  } catch (error) {
    console.error('Greška pri dohvaćanju veterinara:', error);
    $q.notify({
      type: 'negative',
      message: 'Došlo je do pogreške prilikom dohvaćanja veterinara.'
    });
  }
}

// Funkcija za dohvat korisnikovih termina
async function fetchKorisnikoviTermini() {
  try {
    const response = await fetch('http://localhost:3000/api/termini/korisnik', {
      method: 'GET',
      credentials: 'include'
    });
    if (response.ok) {
      const data = await response.json();
      korisnikoviTermini.value = data;
    } else if (response.status === 401) {
      $q.notify({
        type: 'negative',
        message: 'Niste prijavljeni. Molimo prijavite se.'
      });
      router.push('/prijava');
    } else {
      $q.notify({
        type: 'negative',
        message: 'Greška pri dohvaćanju termina: ' + (await response.text())
      });
    }
  } catch (error) {
    console.error('Greška pri dohvaćanju korisnikovih termina:', error);
    $q.notify({
      type: 'negative',
      message: 'Došlo je do pogreške prilikom dohvaćanja termina.'
    });
  }
}

// Funkcija za slanje termina
async function submitTermin() {
  if (!selectedLjubimac.value || !selectedVeterinar.value) {
    $q.notify({
      type: 'negative',
      message: 'Molimo odaberite i ljubimca i veterinara.'
    });
    return;
  }

  const payload = {
    ...termin.value,
    SIFRA_LJUBIMCA: selectedLjubimac.value,
    SIFRA_VETERINARA: selectedVeterinar.value,
  };

  try {
    const response = await fetch('http://localhost:3000/api/termini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      $q.notify({
        type: 'positive',
        message: data.message || 'Termin uspješno zakazan!'
      });
      showScheduleDialog.value = false; // Zatvori dialog
      fetchKorisnikoviTermini(); // Osvježi listu termina
    } else {
      $q.notify({
        type: 'negative',
        message: data.message || 'Greška pri zakazivanju termina.'
      });
    }
  } catch (error) {
    console.error('Greška pri slanju termina:', error);
    $q.notify({
      type: 'negative',
      message: 'Došlo je do pogreške prilikom zakazivanja termina.'
    });
  }
}

// Funkcija za otkazivanje termina
async function cancelTermin(terminId) {
  $q.dialog({
    title: 'Potvrda',
    message: 'Jeste li sigurni da želite otkazati ovaj termin?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/termini/${terminId}/otkazi`, {
        method: 'PUT',
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        $q.notify({
          type: 'positive',
          message: data.message || 'Termin uspješno otkazan.'
        });
        fetchKorisnikoviTermini(); // Osvježi listu termina
      } else {
        $q.notify({
          type: 'negative',
          message: data.message || 'Greška pri otkazivanju termina.'
        });
      }
    } catch (error) {
      console.error('Greška pri otkazivanju termina:', error);
      $q.notify({
        type: 'negative',
        message: 'Došlo je do pogreške prilikom otkazivanja termina.'
      });
    }
  });
}

// Funkcija za određivanje boje statusa
function getStatusColor(status) {
  switch (status) {
    case 'Pending': return 'orange';
    case 'Confirmed': return 'positive';
    case 'Canceled': return 'negative';
    case 'Completed': return 'blue-grey-6';
    default: return 'grey';
  }
}

// Prikaži više/manje termina
function toggleShowAll() {
  showAll.value = !showAll.value;
}

onMounted(() => {
  fetchLjubimci();
  fetchVeterinari();
  fetchKorisnikoviTermini();
});
</script>

<style scoped>
.termini-page {
  background-color: white;
}

.hero-section {
  height: 70vh;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1)), url('/hero_pocetna.avif'); /* Provjeri putanju slike! */
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
}

.termini-section { /* Promijenjen naziv klase */
  background: var(--q-secondary); /* Koristite sekundarnu boju vaše teme */
  border-radius: 15px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.termin-card { /* Promijenjen naziv klase */
  background: white;
  border-radius: 15px;
  padding: 30px;
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
