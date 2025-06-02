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
                  Ljubimac: **{{ t.ime_ljubimca }}**
                </h3>

                <p class="termin-details q-mt-xs text-grey-8">
                  <q-icon name="person" class="q-mr-xs" /> Vlasnik: **{{ t.ime_korisnika }} {{ t.prezime_korisnika }}**
                </p>
                <p class="termin-details text-grey-8">
                  <q-icon name="email" class="q-mr-xs" /> Kontakt: {{ t.email_korisnika }}
                </p>

                <p class="termin-datetime flex items-center q-mt-sm">
                  <q-icon name="calendar_today" class="q-mr-sm" />
                  **{{ t.datum_termina }}** u **{{ t.vrijeme_termina }}**
                </p>

                <p class="termin-description q-mt-sm text-grey-8">
                  **Simptomi:** {{ t.simptomi_ljubimca }}
                </p>
                <p v-if="t.razlog_posjete" class="termin-description q-mt-xs text-grey-8">
                  **Razlog posjete:** {{ t.razlog_posjete }}
                </p>

                <q-badge :color="getStatusColor(t.status_termina)" class="q-mt-md">{{ t.status_termina }}</q-badge>

                <div class="termin-actions q-mt-md flex justify-around">
                  <q-btn flat dense icon="check_circle" label="Potvrdi" color="positive" @click="updateTerminStatus(t.SIFRA_TERMINA, 'Confirmed')" v-if="t.status_termina === 'Pending'"/>
                  <q-btn flat dense icon="cancel" label="Otkaži" color="negative" @click="updateTerminStatus(t.SIFRA_TERMINA, 'Canceled')" v-if="t.status_termina !== 'Canceled' && t.status_termina !== 'Completed'"/>
                  <q-btn flat dense icon="task_alt" label="Završi" color="primary" @click="updateTerminStatus(t.SIFRA_TERMINA, 'Completed')" v-if="t.status_termina === 'Confirmed'"/>
                  <q-btn flat dense icon="medical_services" label="Unesi tretman" color="info" @click="openTretmanDialog(t)" v-if="t.status_termina === 'Completed'"/>
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

    <q-dialog v-model="showTretmanDialog">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Unesi Tretman za Termin: #{{ currentTermin.SIFRA_TERMINA }}</div>
          <div class="text-subtitle2">Ljubimac: {{ currentTermin.ime_ljubimca }} (Vlasnik: {{ currentTermin.ime_korisnika }} {{ currentTermin.prezime_korisnika }})</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="submitTretman" class="q-gutter-md">
            <q-input
              outlined
              v-model="tretman.datum_lijecenja"
              label="Datum liječenja"
              type="date"
              :rules="[val => !!val || 'Molimo odaberite datum liječenja']"
            />

            <q-input
              outlined
              v-model="tretman.vrijeme_lijecenja"
              label="Vrijeme liječenja"
              type="time"
              :rules="[val => !!val || 'Molimo odaberite vrijeme liječenja']"
            />

            <q-input
              outlined
              v-model="tretman.bolest_ljubimca"
              label="Bolest ljubimca (Dijagnoza)"
              type="textarea"
              rows="2"
              :rules="[val => !!val || 'Molimo unesite dijagnozu']"
            />

            <q-input
              outlined
              v-model="tretman.lijecenje_ljubimca"
              label="Liječenje ljubimca (Terapija)"
              type="textarea"
              rows="3"
              :rules="[val => !!val || 'Molimo opišite liječenje']"
            />

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
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const router = useRouter();

const termini = ref([]);
const searchQuery = ref('');
const showTretmanDialog = ref(false); // Kontrola vidljivosti dialoga za tretman
const currentTermin = ref(null); // Čuva podatke o terminu za koji se unosi tretman

const tretman = ref({
  datum_lijecenja: '',
  vrijeme_lijecenja: '',
  bolest_ljubimca: '',
  lijecenje_ljubimca: '',
  SIFRA_VETERINARA: null, // Popunit će se iz logiranog veterinara
  SIFRA_LJUBIMCA: null,   // Popunit će se iz odabranog termina
  SIFRA_TERMINA: null,    // Popunit će se iz odabranog termina
});

// Filtriranje termina
const filteredTermini = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return termini.value.filter(t =>
    (t.ime_ljubimca && t.ime_ljubimca.toLowerCase().includes(query)) ||
    (t.ime_korisnika && t.ime_korisnika.toLowerCase().includes(query)) ||
    (t.prezime_korisnika && t.prezime_korisnika.toLowerCase().includes(query)) ||
    (t.datum_termina && t.datum_termina.includes(query)) ||
    (t.status_termina && t.status_termina.toLowerCase().includes(query)) ||
    (t.simptomi_ljubimca && t.simptomi_ljubimca.toLowerCase().includes(query)) ||
    (t.razlog_posjete && t.razlog_posjete.toLowerCase().includes(query))
  );
});

// Funkcija za dohvat termina za prijavljenog veterinara
async function fetchTerminiZaVeterinara() {
  try {
    const response = await fetch('http://localhost:3000/api/termini/veterinar', {
      method: 'GET',
      credentials: 'include'
    });
    if (response.ok) {
      const data = await response.json();
      termini.value = data;
    } else if (response.status === 401) {
      $q.notify({
        type: 'negative',
        message: 'Niste prijavljeni kao veterinar ili nemate dozvolu.'
      });
      router.push('/prijava'); // Preusmjeri na prijavu
    } else {
      $q.notify({
        type: 'negative',
        message: 'Greška pri dohvaćanju termina za veterinara: ' + (await response.text())
      });
    }
  } catch (error) {
    console.error('Greška pri dohvaćanju termina za veterinara:', error);
    $q.notify({
      type: 'negative',
      message: 'Došlo je do pogreške prilikom dohvaćanja termina za veterinara.'
    });
  }
}

// Funkcija za ažuriranje statusa termina
async function updateTerminStatus(terminId, newStatus) {
  $q.dialog({
    title: 'Potvrda akcije',
    message: `Jeste li sigurni da želite promijeniti status termina u "${newStatus}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/termini/${terminId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (response.ok) {
        $q.notify({
          type: 'positive',
          message: data.message || `Status termina promijenjen u ${newStatus}.`
        });
        fetchTerminiZaVeterinara(); // Osvježi listu termina
      } else {
        $q.notify({
          type: 'negative',
          message: data.message || 'Greška pri ažuriranju statusa termina.'
        });
      }
    } catch (error) {
      console.error('Greška pri ažuriranju statusa termina:', error);
      $q.notify({
        type: 'negative',
        message: 'Došlo je do pogreške prilikom ažuriranja statusa termina.'
      });
    }
  });
}

// Funkcija za otvaranje dialoga za unos tretmana
function openTretmanDialog(termin) {
  currentTermin.value = termin;
  // Inicijalizirajte formu za tretman s podacima iz termina
  tretman.value = {
    datum_lijecenja: termin.datum_termina, // Predlaže datum termina
    vrijeme_lijecenja: termin.vrijeme_termina, // Predlaže vrijeme termina
    bolest_ljubimca: '',
    lijecenje_ljubimca: '',
    SIFRA_VETERINARA: null, // Ovo će backend popuniti na temelju logiranog usera
    SIFRA_LJUBIMCA: termin.SIFRA_LJUBIMCA,
    SIFRA_TERMINA: termin.SIFRA_TERMINA,
  };
  showTretmanDialog.value = true;
}

// Funkcija za slanje tretmana
async function submitTretman() {
  if (!currentTermin.value) {
    $q.notify({ type: 'negative', message: 'Nije odabran termin za unos tretmana.' });
    return;
  }

  const payload = {
    ...tretman.value,
    SIFRA_LJUBIMCA: currentTermin.value.SIFRA_LJUBIMCA,
    SIFRA_TERMINA: currentTermin.value.SIFRA_TERMINA,
    // SIFRA_VETERINARA ne šaljemo, pretpostavljamo da će backend to dohvatiti iz sesije veterinara
  };

  try {
    const response = await fetch('http://localhost:3000/api/tretmani', { // Pretpostavljena ruta za unos tretmana
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      $q.notify({
        type: 'positive',
        message: data.message || 'Tretman uspješno zabilježen!'
      });
      showTretmanDialog.value = false; // Zatvori dialog
      // Opcionalno osvježi termine ili samo obavijesti korisnika
    } else {
      $q.notify({
        type: 'negative',
        message: data.message || 'Greška pri spremanju tretmana.'
      });
    }
  } catch (error) {
    console.error('Greška pri slanju tretmana:', error);
    $q.notify({
      type: 'negative',
      message: 'Došlo je do pogreške prilikom spremanja tretmana.'
    });
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

onMounted(() => {
  fetchTerminiZaVeterinara();
});
</script>

<style scoped>
.veterinar-termini-page { /* Promijenjen naziv klase */
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
  max-width: 700px; /* Dodano za bolji izgled pretraživanja */
  margin-left: auto;
  margin-right: auto;
}

.termini-section {
  background: var(--q-secondary);
  border-radius: 15px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.termin-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  width: 350px; /* Malo šira kako bi se smjestio sadržaj i akcije */
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
  font-weight: 600; /* Dodano za bolji izgled gumba */
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
