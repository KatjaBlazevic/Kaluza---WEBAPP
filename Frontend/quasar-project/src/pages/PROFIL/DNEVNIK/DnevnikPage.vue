<template>
  <q-page class="reminders-page"> <div class="hero-section flex flex-center">
      <div class="hero-content text-center text-white">
        <h1 class="hero-title">Moj dnevnik</h1> <q-btn unelevated label="NOVI UNOS" color="white" text-color="dark" size="lg" class="add-reminder-btn q-mt-md" to="/dodaj-unos" /> </div>
    </div>

    <div class="main-content">
      <div class="q-pa-md">
        <q-input outlined v-model="searchQuery" placeholder="Pretraži unose po naslovu, datumu ili vremenu..." class="search-input">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div v-if="filteredEntries.length > 0">
        <div class="reminders-section"> <div class="row justify-center q-gutter-md">
            <div v-for="entry in (showAll ? filteredEntries : filteredEntries.slice(0, 3))"
                 :key="entry.SIFRA_DNEVNIKA"
                 class="reminder-card col-xs-12 col-sm-6 col-md-4"> <q-card-section class="text-left">
                <h3 class="reminder-title flex items-center"> <q-icon name="favorite" class="q-mr-sm text-red-6" /> <q-input v-if="entry.editMode" v-model="entry.naziv_zapisa" dense outlined />
                  <span v-else>{{ entry.naziv_zapisa }}</span>
                </h3>

                <p v-if="!entry.editMode" class="entry-text q-mt-xs text-grey-8">
                  {{ entry.tekst_zapisa }}
                </p>

                <p class="reminder-datetime flex items-center q-mt-sm"> <q-icon name="event" class="q-mr-sm" /> <q-input v-if="entry.editMode" v-model="entry.datum_zapisa" dense outlined type="date" />
                  <span v-else>{{ entry.datum_zapisa }} u {{ entry.vrijeme_zapisa }}</span>
                </p>

                <q-input v-if="entry.editMode" v-model="entry.vrijeme_zapisa" type="time" dense outlined class="q-mt-sm" />
                <q-input v-if="entry.editMode" v-model="entry.tekst_zapisa" dense outlined type="textarea" rows="4" class="q-mt-sm" />

                <div class="reminder-actions q-mt-md flex justify-around"> <q-btn flat dense icon="edit" :label="entry.editMode ? 'Spremi' : 'Uredi'" color="primary" @click="toggleEdit(entry)" />
                  <q-btn flat dense icon="delete" label="Obriši" color="primary" @click="deleteEntry(entry.SIFRA_DNEVNIKA)" />
                </div>
              </q-card-section>
            </div>
          </div>
        </div>

        <div class="q-mt-lg text-center">
          <q-btn v-if="filteredEntries.length > 3" @click="toggleShowAll" flat color="primary">
            {{ showAll ? 'Prikaži manje' : 'Prikaži više' }}
          </q-btn>
        </div>
      </div>
      <div v-else class="text-center q-pa-md">
        <p class="text-h6 text-grey-7">Nema pronađenih unosa u dnevniku.</p> <p class="text-grey-6">Dodajte novi unos ili prilagodite pretragu.</p> </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const entries = ref([]);
const showAll = ref(false);
const searchQuery = ref('');

// 📌 Filtriranje unosa
const filteredEntries = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return entries.value.filter(entry =>
    entry.naziv_zapisa.toLowerCase().includes(query) ||
    (entry.tekst_zapisa && entry.tekst_zapisa.toLowerCase().includes(query)) ||
    entry.datum_zapisa.includes(query) ||
    entry.vrijeme_zapisa.includes(query)
  );
});

// 📌 Prikaži više/manje unosa
function toggleShowAll() {
  showAll.value = !showAll.value;
}

// 📌 Dohvaćanje unosa iz dnevnika
async function fetchEntries() {
  try {
    const res = await fetch('http://localhost:3000/dnevnik', {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) {
      if (res.status === 401) {
        console.error('Niste prijavljeni. Molimo prijavite se.');
        return [];
      }
      throw new Error(`Greška pri dohvaćanju: ${res.statusText}`);
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("API nije vratio niz unosa dnevnika!");
    }

    entries.value = data.map(entry => ({
      ...entry,
      editMode: false
    }));

  } catch (err) {
    console.error("Greška pri dohvaćanju unosa dnevnika:", err);
  }
}

// 📌 Omogućivanje uređivanja unosa i spremanje
async function toggleEdit(entry) {
  if (entry.editMode) {
    await updateEntry(entry);
    await fetchEntries();
  }
  entry.editMode = !entry.editMode;
}

// 📌 Ažuriranje unosa u dnevniku
async function updateEntry(entry) {

  let datumZaBackend = entry.datum_zapisa;
  if (datumZaBackend.includes(".")) {
    const parts = datumZaBackend.split('.');
    if (parts.length === 3) {
      datumZaBackend = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }

  const requestBody = {
    naziv_zapisa: entry.naziv_zapisa,
    tekst_zapisa: entry.tekst_zapisa,
    datum_zapisa: datumZaBackend,
    vrijeme_zapisa: entry.vrijeme_zapisa
  };

  try {
    const response = await fetch(`http://localhost:3000/dnevnik/${entry.SIFRA_DNEVNIKA}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Greška servera: ${errorData.poruka || response.statusText}`);
    }

    console.log("Unos u dnevnik uspješno ažuriran.");
  } catch (err) {
    console.error("Greška pri ažuriranju unosa dnevnika:", err);
  }
}

// 📌 Brisanje unosa u dnevniku
async function deleteEntry(id) {
  if (confirm('Jeste li sigurni da želite obrisati ovaj unos iz dnevnika?')) {
    try {
      const response = await fetch(`http://localhost:3000/dnevnik/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Greška servera: ${errorData.poruka || response.statusText}`);
      }

      console.log(`Unos s ID ${id} uspješno obrisan.`);
      await fetchEntries();
    } catch (err) {
      console.error('Greška pri brisanju unosa dnevnika:', err);
    }
  }
}

onMounted(fetchEntries);
</script>

<style scoped>
.reminders-page {
  background-color: white;
}

.hero-section {
  height: 70vh;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1)), url('hero_pocetna.avif');
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

.add-reminder-btn {
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

.reminders-section {
  background: var(--q-secondary);
  border-radius: 15px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.reminder-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  width: 350px;
  text-align: left;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.reminder-title {
  font-size: 1.3rem;
  font-weight: bold;
  line-height: 1.7;
  color: var(--q-dark);
}

.entry-text { /* ✅ Novi stil za tekst zapisa, sličan datetimeu */
  font-size: 0.95em;
  color: #555; /* Tamnija nijansa sive za bolju čitljivost */
  margin-bottom: 10px; /* Razmak ispod teksta zapisa */
}


.reminder-datetime {
  font-size: 1em;
  color: gray;
}

.reminder-actions .q-btn {
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

  .reminders-section {
    padding: 30px;
  }

  .reminder-card {
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

  .reminders-section {
    padding: 20px;
  }
}
</style>
