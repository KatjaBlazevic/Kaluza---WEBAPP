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
                  <q-icon name="person" class="q-mr-xs" /> Veterinar: {{ t.ime_veterinara }} {{ t.prezime_veterinara }} ({{ t.specijalizacija_veterinara }})
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
                  <q-btn flat dense icon="edit" label="Uredi" color="primary" @click="openEditDialog(t)" />
                  <q-btn flat dense icon="cancel" label="Otkaži" color="negative" @click="cancelTermin(t.SIFRA_TERMINA)" v-if="t.status_termina === 'Pending'" />
                  <q-btn flat dense icon="medical_services" label="Pogledaj tretmane" color="primary" @click="fetchTretmaniZaTermin(t.SIFRA_TERMINA)" />
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
              placeholder="dd.mm.yyyy"
              mask="##.##.####"
              fill-mask
              @blur="validateDateFormat"
            />

            <q-input
              outlined
              v-model="termin.vrijeme_termina"
              label="Vrijeme termina"
              placeholder="hh:mm"
              mask="##:##"
              fill-mask
              @blur="validateTimeFormat"
            />

            <q-input outlined v-model="termin.simptomi_ljubimca" label="Simptomi ljubimca" type="textarea" rows="3"/>
            <q-input outlined v-model="termin.razlog_posjete" label="Razlog posjete" type="textarea" rows="2"/>

            <div class="flex justify-center q-mt-lg">
              <q-btn label="Zakaži Termin" type="submit" color="primary" unelevated size="lg"/>
              <q-btn label="Odustani" color="negative" flat class="q-ml-sm" @click="showScheduleDialog = false" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showEditDialog">
        <q-card style="width: 700px; max-width: 80vw;">
            <q-card-section>
                <div class="text-h6">Uredi Termin</div>
            </q-card-section>
            <q-card-section class="q-pt-none" v-if="currentTermin">
                <q-form @submit="submitEditTermin" class="q-gutter-md">
                    <q-input outlined v-model="currentTermin.datum_termina" label="Datum termina" mask="##.##.####" fill-mask @blur="validateDateFormat" />
                    <q-input outlined v-model="currentTermin.vrijeme_termina" label="Vrijeme termina" mask="##:##" fill-mask @blur="validateTimeFormat" />
                    <q-input outlined v-model="currentTermin.simptomi_ljubimca" label="Simptomi ljubimca" type="textarea" rows="3" />
                    <q-input outlined v-model="currentTermin.razlog_posjete" label="Razlog posjete" type="textarea" rows="2" />
                    <div class="flex justify-center q-mt-lg">
                        <q-btn label="Spremi Promjene" type="submit" color="primary" unelevated size="lg" />
                        <q-btn label="Odustani" color="negative" flat class="q-ml-sm" @click="showEditDialog = false" />
                    </div>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>

    <q-dialog v-model="showTretmaniDialog">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Tretmani vaših ljubimaca</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div v-if="prikazaniTretmani.length > 0">
            <q-list bordered separator>
              <q-item v-for="tretman in prikazaniTretmani" :key="tretman.SIFRA_TRETMANA">
                <q-item-section>
                  <q-item-label><strong>Ljubimac:</strong> {{ tretman.ime_ljubimca }}</q-item-label>
                  <q-item-label><strong>Datum liječenja:</strong> {{ formatDate(tretman.datum_lijecenja) }}</q-item-label>
                  <q-item-label><strong>Vrijeme liječenja:</strong> {{ formatTime(tretman.vrijeme_lijecenja) }}</q-item-label>
                  <q-item-label><strong>Bolest:</strong> {{ tretman.bolest_ljubimca }}</q-item-label>
                  <q-item-label><strong>Terapija:</strong> {{ tretman.lijecenje_ljubimca }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <p v-else class="text-center text-grey-6">Nema tretmana za ovaj termin.</p>
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
const showAll = ref(false);
const showScheduleDialog = ref(false);
const showEditDialog = ref(false);
const currentTermin = ref(null);
const prikazaniTretmani = ref([]);
const showTretmaniDialog = ref(false);

// Helper funkcija za dohvaćanje JWT tokena i postavljanje headera
function getAuthHeaders() {
  const token = userStore.token || localStorage.getItem('token'); // Dohvati token iz Pinia store-a ili localStorage-a
  if (!token) {
    // Ako nema tokena, preusmjeri na prijavu
    console.error('Niste prijavljeni. Molimo prijavite se.');
    alert('Sesija je istekla. Molimo prijavite se ponovno.');
    userStore.clearUser(); // Očisti store i localStorage
    router.push('/prijava');
    return null;
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // Prilagodi za JWT
  };
}

// Funkcija za provjeru odgovora i rukovanje 401/403 greškama
async function handleApiResponse(response) {
  if (response.status === 401 || response.status === 403) {
    console.error('Sesija je istekla ili nemate ovlasti. Molimo prijavite se ponovno.');
    alert('Sesija je istekla ili nemate ovlasti. Molimo prijavite se ponovno.');
    userStore.clearUser();
    router.push('/prijava');
    return false; // Označava da je greška autentifikacije/autorizacije
  }
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Greška:', errorText);
    alert(`Greška na serveru: ${errorText.substring(0, 100)}...`); // Prikazi dio greške
    return false; // Označava da je bila neka druga greška
  }
  return true; // Označava uspješan odgovor
}


async function fetchUserProfile() {
  if (!userStore.isAuthenticated) {
    await userStore.initializeUser(); // Pokušaj inicijalizirati korisnika iz localStorage
  }

  const headers = getAuthHeaders();
  if (!headers) return; // Nema tokena, preusmjerenje se već dogodilo

  try {
    const res = await fetch('http://localhost:3000/profile', {
      headers: headers // Sada šaljemo JWT
    });

    if (!await handleApiResponse(res)) return; // Provjeri greške

    const data = await res.json();
    userStore.setUser({
      ...data,
      id: data.SIFRA_KORISNIKA, // Provjerite da li se ID u backendu zove SIFRA_KORISNIKA
    });
  } catch (err) {
    console.error('❌ Greška pri dohvaćanju profila:', err);
    alert('Greška pri dohvaćanju korisničkog profila.');
  }
}

function validateTimeFormat() {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!regex.test(termin.value.vrijeme_termina)) {
    alert("Molimo unesite vrijeme u formatu HH:mm (npr. 14:30)");
    termin.value.vrijeme_termina = "";
  }
}

function validateDateFormat() {
  const regex = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/;
  if (!regex.test(termin.value.datum_termina)) {
    alert("Molimo unesite datum u formatu dd.mm.yyyy (npr. 05.06.2025)");
    termin.value.datum_termina = "";
  }
}

function convertDateToBackendFormat(date) {
  if (!date || !date.includes(".")) return date;
  const [day, month, year] = date.split(".");
  return `${year}-${month}-${day}`;
}

function formatDate(date) {
  if (!date) return "";
  const dateObj = new Date(date);
  return `${dateObj.getDate().toString().padStart(2, '0')}.${(dateObj.getMonth() + 1).toString().padStart(2, '0')}.${dateObj.getFullYear()}`; // Puni format godine
}
function formatTime(time) {
  if (!time) return "";
  return time.slice(0, 5); // Skida sekunde, prikazuje HH:MM
}

const filteredTermini = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return korisnikoviTermini.value.filter(t =>
    t.ime_ljubimca.toLowerCase().includes(query) ||
    t.ime_veterinara.toLowerCase().includes(query) ||
    formatDate(t.datum_termina).includes(query) ||
    t.status_termina.toLowerCase().includes(query) ||
    (t.simptomi_ljubimca && t.simptomi_ljubimca.toLowerCase().includes(query)) ||
    (t.razlog_posjete && t.razlog_posjete.toLowerCase().includes(query))
  );
});

function openScheduleDialog() {
  showScheduleDialog.value = true;
  termin.value = {
    datum_termina: '',
    vrijeme_termina: '',
    simptomi_ljubimca: '',
    razlog_posjete: '',
  };
  selectedLjubimac.value = null;
  selectedVeterinar.value = null;
}

function openEditDialog(terminData) {
  currentTermin.value = {
    ...terminData,
    datum_termina: formatDate(terminData.datum_termina), // Formatiraj za prikaz u inputu
    vrijeme_termina: formatTime(terminData.vrijeme_termina)
  };
  showEditDialog.value = true;
}


async function submitEditTermin() {
  if (!currentTermin.value) {
    console.error('❌ Nema odabranog termina za uređivanje.');
    alert('Nema odabranog termina za uređivanje.');
    return;
  }

  const headers = getAuthHeaders();
  if (!headers) return;

  // Konvertiraj datum u YYYY-MM-DD format za backend
  const datumZaBackend = convertDateToBackendFormat(currentTermin.value.datum_termina);

  try {
    const response = await fetch(`http://localhost:3000/uredi-termin-korisnik/${currentTermin.value.SIFRA_TERMINA}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify({
        datum_termina: datumZaBackend,
        vrijeme_termina: currentTermin.value.vrijeme_termina,
        simptomi_ljubimca: currentTermin.value.simptomi_ljubimca,
        razlog_posjete: currentTermin.value.razlog_posjete
      })
    });

    if (!await handleApiResponse(response)) return;

    alert('Termin uspješno ažuriran.');
    showEditDialog.value = false;
    fetchKorisnikoviTermini();
  } catch (error) {
    console.error('❌ Došlo je do pogreške pri ažuriranju termina:', error);
    alert('Došlo je do pogreške pri ažuriranju termina.');
  }
}

async function fetchLjubimci() {
  const headers = getAuthHeaders();
  if (!headers) return;

  try {
    const response = await fetch('http://localhost:3000/moji-ljubimci', {
      method: 'GET',
      headers: headers
    });
    if (!await handleApiResponse(response)) return;

    const data = await response.json();
    ljubimciOptions.value = data.map(lj => ({
      label: lj.ime_ljubimca,
      value: lj.SIFRA_LJUBIMCA
    }));
  } catch (error) {
    console.error('Greška pri dohvaćanju ljubimaca:', error);
    alert('Došlo je do pogreške prilikom dohvaćanja ljubimaca.');
  }
}

async function fetchVeterinari() {
  const headers = getAuthHeaders();
  if (!headers) return;

  try {
    const response = await fetch('http://localhost:3000/veterinari', {
      method: 'GET',
      headers: headers
    });

    if (!await handleApiResponse(response)) return;

    const data = await response.json();

    veterinariOptions.value = data.map(vet => ({
      label: `${vet.ime_veterinara} ${vet.prezime_veterinara} (${vet.specijalizacija_veterinara})`,
      value: vet.SIFRA_VETERINARA
    }));
  } catch (error) {
    console.error('❌ Došlo je do pogreške prilikom dohvaćanja veterinara:', error);
    alert('Došlo je do pogreške prilikom dohvaćanja veterinara.');
  }
}


async function fetchKorisnikoviTermini() {
  const headers = getAuthHeaders();
  if (!headers) return;

  try {
    const response = await fetch('http://localhost:3000/termini', { // Promijenjen endpoint na /termini
      method: 'GET',
      headers: headers
    });
    if (!await handleApiResponse(response)) return;

    const data = await response.json();
    korisnikoviTermini.value = data;
  } catch (error) {
    console.error('Greška pri dohvaćanju korisnikovih termina:', error);
    alert('Došlo je do pogreške prilikom dohvaćanja termina.');
  }
}

async function fetchTretmaniZaTermin(terminId) {
  const headers = getAuthHeaders();
  if (!headers) return;

  try {
    // SIFRA_KORISNIKA je uklonjena iz URL-a
    const response = await fetch(`http://localhost:3000/tretmani/termin/${terminId}`, {
      method: "GET",
      headers: headers,
    });

    if (!await handleApiResponse(response)) return;

    const data = await response.json();

    prikazaniTretmani.value = data;
    showTretmaniDialog.value = true;

  } catch (err) {
    console.error("Greška pri dohvaćanju tretmana:", err);
    alert("Greška pri dohvaćanju tretmana.");
  }
}


async function submitTermin() {
  if (!selectedLjubimac.value || !selectedVeterinar.value) {
    console.error('❌ Molimo odaberite i ljubimca i veterinara.');
    alert('Molimo odaberite i ljubimca i veterinara.');
    return;
  }

  const headers = getAuthHeaders();
  if (!headers) return;

  // SIFRA_KORISNIKA je uklonjena iz payload-a jer se dohvaća na backendu iz JWT-a
  const payload = {
    datum_termina: convertDateToBackendFormat(termin.value.datum_termina),
    vrijeme_termina: termin.value.vrijeme_termina,
    simptomi_ljubimca: termin.value.simptomi_ljubimca,
    razlog_posjete: termin.value.razlog_posjete,
    SIFRA_LJUBIMCA: selectedLjubimac.value,
    SIFRA_VETERINARA: selectedVeterinar.value,
  };

  try {
    const response = await fetch('http://localhost:3000/zakazi-termin', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (!await handleApiResponse(response)) return;

    alert('Termin uspješno zakazan.');
    showScheduleDialog.value = false;
    fetchKorisnikoviTermini(); // Osvježi listu termina
  } catch (error) {
    console.error('❌ Došlo je do pogreške prilikom zakazivanja termina:', error);
    alert('Došlo je do pogreške prilikom zakazivanja termina.');
  }
}

async function cancelTermin(terminId) {
  if (confirm("Jeste li sigurni da želite otkazati ovaj termin?")) {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await fetch(`http://localhost:3000/otkazi-termin-korisnik/${terminId}`, {
        method: 'PUT',
        headers: headers
      });

      if (!await handleApiResponse(response)) return;

      alert('Termin uspješno otkazan.');
      await fetchKorisnikoviTermini(); // Osvježi listu termina
    } catch (error) {
      console.error('❌ Došlo je do pogreške prilikom otkazivanja termina:', error);
      alert('Došlo je do pogreške prilikom otkazivanja termina.');
    }
  }
}

function getStatusColor(status) {
  switch (status) {
    case 'Pending': return 'orange';
    case 'Confirmed': return 'positive';
    case 'Canceled': return 'negative';
    case 'Completed': return 'blue-grey-6';
    default: return 'grey';
  }
}

function toggleShowAll() {
  showAll.value = !showAll.value;
}

onMounted(() => {
  // `fetchUserProfile` će također inicijalizirati korisnika iz storea,
  // što je važno za dohvaćanje tokena.
  fetchUserProfile();
  fetchLjubimci();
  fetchVeterinari();
  fetchKorisnikoviTermini();
});
</script>

<style scoped>
/* Vaši stilovi ostaju isti */
.termini-page {
  background-color: white;
}

.hero-section {
  height: 70vh;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1)), url('/hero_onama.png');
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

.add-termin-btn {
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

.termini-section {
  background: var(--q-secondary);
  border-radius: 15px;
  padding: 40px;
  margin-bottom: -50px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.termin-card {
  background: white;
  border-radius: 15px;
  padding: 20px;
  width: 350px;
  text-align: left;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.termin-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.termin-title {
  font-size: 1.3rem;
  font-weight: bold;
  line-height: 1.7;
  color: var(--q-dark);
}

.termin-datetime, .termin-details, .termin-description {
  font-size: 1em;
  color: gray;
}

.termin-actions .q-btn {
  min-width: unset;
}

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
