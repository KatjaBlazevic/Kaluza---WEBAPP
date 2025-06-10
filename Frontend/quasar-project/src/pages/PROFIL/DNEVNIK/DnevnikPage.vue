<template>
  <q-page class="diary-page">
    <div class="hero-section flex flex-center">
      <div class="hero-content text-center text-white">
        <h1 class="hero-title">Moj dnevnik</h1>
        <q-btn unelevated label="NOVI UNOS" color="white" text-color="dark" size="lg" class="add-reminder-btn q-mt-md" to="/dodaj-unos" />
      </div>
    </div>

    <div class="main-content">
      <div class="q-pa-md row q-gutter-md items-center">
        <q-input outlined v-model="searchQuery" placeholder="Pretraži unose po naslovu, datumu ili vremenu..." class="search-input col-grow">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div v-if="filteredEntries.length > 0">
        <div class="entries-section"> <div class="row justify-center q-gutter-md">
            <div v-for="entry in (showAll ? filteredEntries : filteredEntries.slice(0, 3))"
                 :key="entry.SIFRA_DNEVNIKA"
                 class="entry-card col-xs-12 col-sm-6 col-md-4"> <q-card-section class="text-left">
                <h3 class="reminder-title flex items-center">
                  <q-icon name="favorite" class="q-mr-sm text-red-6" />
                  <q-input v-if="entry.editMode" v-model="entry.naziv_zapisa" dense outlined />
                  <span v-else>{{ entry.naziv_zapisa }}</span>
                </h3>

                <p v-if="!entry.editMode" class="entry-text q-mt-xs text-grey-8">
                  {{ entry.tekst_zapisa }}
                </p>

                <p class="entry-datetime flex items-center q-mt-sm"> <q-icon name="event" class="q-mr-sm" />
                  <q-input v-if="entry.editMode" v-model="entry.datum_zapisa_input" dense outlined type="date" />
                  <span v-else>{{ formatCroatianDate(entry.datum_zapisa) }} u {{ entry.vrijeme_zapisa }}</span>
                </p>

                <q-input v-if="entry.editMode" v-model="entry.vrijeme_zapisa" type="time" dense outlined class="q-mt-sm" />
                <q-input v-if="entry.editMode" v-model="entry.tekst_zapisa" dense outlined type="textarea" rows="4" class="q-mt-sm" />

                <div class="reminder-actions q-mt-md flex justify-around">
                  <q-btn flat dense icon="edit" :label="entry.editMode ? 'Spremi' : 'Uredi'" color="primary"
                    @click="toggleEdit(entry)" />
                  <q-btn flat dense icon="delete" label="Obriši" color="negative"
                    @click="deleteEntry(entry.SIFRA_DNEVNIKA)" />
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
        <p class="text-h6 text-grey-7">Nema pronađenih unosa u dnevniku.</p>
        <p class="text-grey-6">Dodajte novi unos ili prilagodite pretragu.</p>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
// Uklonjen import za useQuasar jer se više ne koriste q.notify
import { useUserStore } from '@/stores/user';

const entries = ref([]);
const showAll = ref(false);
const searchQuery = ref('');
const router = useRouter();
const userStore = useUserStore();

// Pomoćna funkcija za formatiranje datuma za prikaz (YYYY-MM-DD u DD.MM.YYYY.)
// MODIFICIRANO: Uvijek dodaje točku na kraju, bez obzira na ulazni format
const formatCroatianDate = (dateString) => {
  if (!dateString) return '';

  // Provjeri je li ulazni string već u DD.MM.YYYY formatu (bez točke na kraju)
  // ili je u YYYY-MM-DD formatu
  if (dateString.match(/^\d{2}\.\d{2}\.\d{4}$/)) { // Npr. 05.06.2025
    return `${dateString}.`; // Dodaj točku ako već nije (za stare unose)
  } else if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) { // Npr. 2025-06-05
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}.`; // Formatiraj i dodaj točku
  }
  // Ako je format nepoznat, vrati originalni string (ili prazan string)
  return dateString;
};

// 📌 Filtriranje unosa
const filteredEntries = computed(() => {
  const query = searchQuery.value.toLowerCase();
  let filtered = entries.value.filter(entry =>
    entry.naziv_zapisa.toLowerCase().includes(query) ||
    (entry.tekst_zapisa && entry.tekst_zapisa.toLowerCase().includes(query)) ||
    // Koristi formatCroatianDate za pretragu, ali makni zadnju točku radi usporedbe s DD.MM.YYYY iz queryja
    formatCroatianDate(entry.datum_zapisa).replace(/\.$/, '').includes(query) ||
    entry.vrijeme_zapisa.includes(query)
  );
  return filtered;
});

// 📌 Prikaži više/manje unosa
function toggleShowAll() {
  showAll.value = !showAll.value;
}

// 📌 Dohvaćanje unosa iz dnevnika
async function fetchEntries() {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/prijava');
    console.error('Niste prijavljeni. Molimo prijavite se.');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/dnevnik', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      userStore.clearUser();
      router.push('/prijava');
      console.error('Sesija istekla ili token nevažeći. Molimo prijavite se ponovno.');
      return;
    }

    if (!res.ok) {
      throw new Error(`Greška pri dohvaćanju: ${res.statusText}`);
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("API nije vratio niz unosa dnevnika!");
    }

    entries.value = data.map(entry => ({
      ...entry,
      editMode: false,
      datum_zapisa_input: entry.datum_zapisa // Backend vraća YYYY-MM-DD, što je idealno za type="date"
    }));

  } catch (err) {
    console.error("Greška pri dohvaćanju unosa dnevnika:", err);
  }
}

// 📌 Omogućivanje uređivanja unosa i spremanje
async function toggleEdit(entry) {
  if (entry.editMode) {
    // entry.datum_zapisa_input (tipa "date") je već u YYYY-MM-DD formatu, direktno ga koristimo
    entry.datum_zapisa = entry.datum_zapisa_input;

    await updateEntry(entry);
    await fetchEntries();
  } else {
    // Kada ulazimo u edit mode, inicijaliziraj datum_zapisa_input s postojećim datumom (koji je YYYY-MM-DD)
    entry.datum_zapisa_input = entry.datum_zapisa;
  }
  entry.editMode = !entry.editMode;
}

// 📌 Ažuriranje unosa u dnevniku
async function updateEntry(entry) {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/prijava');
    console.error('Niste prijavljeni. Molimo prijavite se.');
    return;
  }

  const requestBody = {
    naziv_zapisa: entry.naziv_zapisa,
    tekst_zapisa: entry.tekst_zapisa,
    datum_zapisa: entry.datum_zapisa, // Ovo je već YYYY-MM-DD
    vrijeme_zapisa: entry.vrijeme_zapisa // Ovo je HH:MM
  };

  console.log("Frontend šalje na PUT (Dnevnik):", requestBody);

  try {
    const response = await fetch(`http://localhost:3000/dnevnik/${entry.SIFRA_DNEVNIKA}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token');
      userStore.clearUser();
      router.push('/prijava');
      console.error('Sesija istekla ili token nevažeći. Molimo prijavite se ponovno.');
      return;
    }

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
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/prijava');
      console.error('Niste prijavljeni. Molimo prijavite se.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/dnevnik/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        userStore.clearUser();
        router.push('/prijava');
        console.error('Sesija istekla ili token nevažeći. Molimo prijavite se ponovno.');
        return;
      }

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
/* Vaši postojeći stilovi, promijenjene klase reminder-card u entry-card i reminders-section u entries-section */
.diary-page {
  background-color: white;
}

.hero-section {
  height: 70vh;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1)), url('/hero_kontakt.jpg');
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

.entries-section {
  background: var(--q-secondary);
  border-radius: 15px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.entry-card {
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

.entry-text {
  font-size: 0.95em;
  color: #555;
  margin-bottom: 10px;
}

.entry-datetime {
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

  .entries-section {
    padding: 30px;
  }

  .entry-card {
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

  .entries-section {
    padding: 20px;
  }

  .search-input {
    width: 100%;
  }
}
</style>
