<template>
  <q-page class="veterinar-tretmani-page">
    <div class="hero-section flex flex-center">
      <div class="hero-content text-center text-white">
        <h1 class="hero-title">Upravljanje Tretmanima</h1>
        <q-btn unelevated label="Unesi tretman" color="white" text-color="dark" size="lg" class="add-tretman-btn q-mt-md" @click="openTretmanDialog" />
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
            <div v-for="t in (showAllTretmani ? filteredTretmani : filteredTretmani.slice(0, 3))"
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

          <div class="q-mt-lg text-center">
            <q-btn v-if="filteredTretmani.length > 3" @click="toggleShowAllTretmani" flat color="primary">
              {{ showAllTretmani ? 'Prikaži manje' : 'Prikaži više' }}
            </q-btn>
          </div>
        </div>
      </div>
      <div v-else class="text-center q-pa-md">
        <p class="text-h6 text-grey-7">Nema pronađenih tretmana.</p>
      </div>
    </div>

    <q-dialog v-model="showTretmanDialog">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Unesi Novi Tretman</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="submitTretman" class="q-gutter-md">
            <q-select
              outlined
              v-model="noviTretman.SIFRA_LJUBIMCA"
              :options="ljubimciOptions"
              label="Odaberi ljubimca"
              emit-value
              map-options
              :rules="[val => !!val || 'Molimo odaberite ljubimca']"
            />

            <q-select
              outlined
              v-model="noviTretman.SIFRA_TERMINA"
              :options="filteredTerminiOptions"
              label="Odaberi termin"
              emit-value
              map-options
              :rules="[val => !!val || 'Molimo odaberite termin']"
            />

            <q-input
              outlined
              v-model="noviTretman.datum_lijecenja"
              label="Datum liječenja"
              placeholder="dd.mm.yyyy"
              mask="##.##.####"
              fill-mask
              @blur="validateDateFormat"
            />

            <q-input
              outlined
              v-model="noviTretman.vrijeme_lijecenja"
              label="Vrijeme liječenja"
              placeholder="hh:mm"
              mask="##:##"
              fill-mask
              @blur="validateTimeFormat"
            />

            <q-input outlined v-model="noviTretman.bolest_ljubimca" label="Dijagnoza" type="textarea" rows="3"/>
            <q-input outlined v-model="noviTretman.lijecenje_ljubimca" label="Terapija" type="textarea" rows="2"/>

            <div class="flex justify-center q-mt-lg">
              <q-btn label="Spremi Tretman" type="submit" color="primary" unelevated size="lg"/>
              <q-btn label="Odustani" color="negative" flat class="q-ml-sm" @click="showTretmanDialog = false" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

const tretmani = ref([]);
const searchQuery = ref('');
const showTretmanDialog = ref(false);
const noviTretman = ref({
  datum_lijecenja: '',
  vrijeme_lijecenja: '',
  bolest_ljubimca: '',
  lijecenje_ljubimca: '',
  SIFRA_LJUBIMCA: null,
  SIFRA_TERMINA: null
});
const ljubimciOptions = ref([]);
const terminiOptions = ref([]);
const showAllTretmani = ref(false);

const filteredTerminiOptions = computed(() => {
  if (!noviTretman.value.SIFRA_LJUBIMCA) return [];
  return terminiOptions.value.filter(t => t.SIFRA_LJUBIMCA === noviTretman.value.SIFRA_LJUBIMCA);
});

function toggleShowAllTretmani() {
  showAllTretmani.value = !showAllTretmani.value;
}

function validateDateFormat() {
  const regex = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/;
  if (!regex.test(noviTretman.value.datum_lijecenja)) {
    console.error("Molimo unesite datum u formatu dd.mm.yyyy (npr. 05.06.2025)");
    noviTretman.value.datum_lijecenja = "";
  }
}

function validateTimeFormat() {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!regex.test(noviTretman.value.vrijeme_lijecenja)) {
    console.error("Molimo unesite vrijeme u formatu HH:mm (npr. 14:30)");
    noviTretman.value.vrijeme_lijecenja = "";
  }
}

function convertDateToBackendFormat(date) {
  if (!date || !date.includes(".")) return date;

  const [day, month, year] = date.split(".");
  return `${year}-${month}-${day}`;
}

function formatDate(isoDate) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

function formatTime(timeString) {
  if (!timeString) return "";
  return timeString.slice(0, 5);
}

const filteredTretmani = computed(() => {
  if (!tretmani.value) return [];
  const query = searchQuery.value.toLowerCase();
  return tretmani.value.filter(t =>
    (t.ime_ljubimca && t.ime_ljubimca.toLowerCase().includes(query)) ||
    (t.bolest_ljubimca && t.bolest_ljubimca.toLowerCase().includes(query)) || // Ispravljeno: bolimca -> bolest_ljubimca
    (t.lijecenje_ljubimca && t.lijecenje_ljubimca.toLowerCase().includes(query))
  );
});

async function openTretmanDialog() {
  if (!userStore.isAuthenticated || userStore.getUserRole !== 'veterinar') {
    console.warn('Pristup odbijen: Nemate dozvolu za unos tretmana. Prijavite se kao veterinar.');
    router.push('/prijava');
    return;
  }
  showTretmanDialog.value = true;
  noviTretman.value = {
    datum_lijecenja: '',
    vrijeme_lijecenja: '',
    bolest_ljubimca: '', // Prazno po defaultu
    lijecenje_ljubimca: '', // Prazno po defaultu
    SIFRA_LJUBIMCA: null,
    SIFRA_TERMINA: null
  };
  await fetchLjubimci();
  await fetchTermini();
}

async function fetchLjubimci() {
  if (!userStore.isAuthenticated || userStore.getUserRole !== 'veterinar') {
      console.warn('Pristup odbijen: Korisnik nije veterinar ili nije prijavljen.');
      return;
  }
  const token = userStore.token;

  try {
    // ✅ URL za dohvat svih ljubimaca koje veterinar može vidjeti
    const response = await fetch(`http://localhost:3000/veterinar/moji-ljubimci`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 403 || response.status === 401) {
        console.error('Vaša sesija je istekla ili nemate dozvolu. Molimo prijavite se ponovno.');
        userStore.clearUser();
        router.push('/prijava');
        return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Greška pri dohvaćanju ljubimaca:", response.status, errorText);
      return;
    }

    const data = await response.json();
    ljubimciOptions.value = data.map(l => ({ label: `${l.ime_ljubimca} (Vlasnik: ${l.ime_korisnika || ''} ${l.prezime_korisnika || ''})`, value: l.SIFRA_LJUBIMCA }));

  } catch (err) {
    console.error("Greška pri dohvaćanju ljubimaca:", err);
  }
}

async function fetchTermini() {
  if (!userStore.isAuthenticated || userStore.getUserRole !== 'veterinar') {
      console.warn('Pristup odbijen: Korisnik nije veterinar ili nije prijavljen.');
      return;
  }
  const token = userStore.token;

  try {
    const response = await fetch(`http://localhost:3000/veterinar/termini`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 403 || response.status === 401) {
        console.error('Vaša sesija je istekla ili nemate dozvolu. Molimo prijavite se ponovno.');
        userStore.clearUser();
        router.push('/prijava');
        return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Greška pri dohvaćanju termina:", response.status, errorText);
      return;
    }
    const data = await response.json();
    terminiOptions.value = data.map(t => ({
      label: `Termin za ${t.ime_ljubimca} - ${formatDate(t.datum_termina)} u ${formatTime(t.vrijeme_termina)}`,
      value: t.SIFRA_TERMINA,
      SIFRA_LJUBIMCA: t.SIFRA_LJUBIMCA
    }));
  } catch (err) {
    console.error("❌ Greška pri dohvaćanju termina:", err);
  }
}

async function submitTretman() {
  if (!userStore.isAuthenticated || userStore.getUserRole !== 'veterinar') {
    console.warn('Nemate dozvolu za spremanje tretmana. Prijavite se kao veterinar.');
    router.push('/prijava');
    return;
  }

  // Provjera obaveznih polja (ljubimac, termin, datum, vrijeme)
  if (!noviTretman.value.SIFRA_LJUBIMCA || !noviTretman.value.SIFRA_TERMINA) {
    console.error("Molimo odaberite ljubimca i termin!");
    return;
  }

  validateDateFormat();
  validateTimeFormat();
  if (noviTretman.value.datum_lijecenja === "" || noviTretman.value.vrijeme_lijecenja === "") {
      return;
  }

  const payload = {
    ...noviTretman.value,
    datum_lijecenja: convertDateToBackendFormat(noviTretman.value.datum_lijecenja),
    // Osiguravamo da se prazni stringovi šalju ako polja nisu popunjena
    bolest_ljubimca: noviTretman.value.bolest_ljubimca || '',
    lijecenje_ljubimca: noviTretman.value.lijecenje_ljubimca || ''
  };
  const token = userStore.token;

  try {
    const response = await fetch(`http://localhost:3000/tretmani`, { // Održavamo /tretmani kao POST rutu
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 403 || response.status === 401) {
        console.error('Vaša sesija je istekla ili nemate dozvolu za dodavanje tretmana. Molimo prijavite se ponovno.');
        userStore.clearUser();
        router.push('/prijava');
        return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Greška pri unosu tretmana:", response.status, errorData.message || response.statusText);
      return;
    }

    console.log('Tretman uspješno unesen!');
    showTretmanDialog.value = false;
    fetchTretmaniVeterinara(); // Osvježi listu tretmana nakon unosa

  } catch (err) {
    console.error("Greška pri unosu tretmana:", err);
  }
}

async function fetchTretmaniVeterinara() {
  if (!userStore.isAuthenticated || userStore.getUserRole !== 'veterinar') {
    console.warn('Nemate dozvolu za pristup ovoj stranici. Prijavite se kao veterinar.');
    router.push('/prijava');
    return;
  }

  const token = userStore.token;

  try {
    const response = await fetch(`http://localhost:3000/tretmani/veterinar`, { // API ruta je /tretmani/veterinar
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 403 || response.status === 401) {
        console.error('Vaša sesija je istekla ili nemate dozvolu. Molimo prijavite se ponovno.');
        userStore.clearUser();
        router.push('/prijava');
        return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Greška pri dohvaćanju tretmana:", response.status, errorText);
      return;
    }

    const data = await response.json();
    tretmani.value = data;

  } catch (err) {
    console.error("Greška pri dohvaćanju tretmana:", err);
  }
}

onMounted(() => {
  fetchTretmaniVeterinara();
});
</script>

<style scoped>
/* Vaši postojeći stilovi ostaju nepromijenjeni */
.veterinar-tretmani-page {
  background-color: white;
}

.hero-section {
  height: 70vh;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1)), url('/hero_dogadaji.jpg');
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

.add-tretman-btn {
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
