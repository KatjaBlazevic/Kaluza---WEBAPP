<template>
  <q-page class="reminders-page">
    <div class="hero-section flex flex-center">
      <div class="hero-content text-center text-white">
        <h1 class="hero-title">Moji podsjetnici</h1>
        <q-btn unelevated label="DODAJ PODSJETNIK" color="white" text-color="dark" size="lg" class="add-reminder-btn q-mt-md" to="/dodaj-podsjetnik" />
      </div>
    </div>

    <div class="main-content">
      <div class="q-pa-md">
        <q-input outlined v-model="searchQuery" placeholder="Pretraži podsjetnike po nazivu, datumu ili vremenu..." class="search-input">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div v-if="filteredReminders.length > 0">
        <div class="reminders-section">
          <div class="row justify-center q-gutter-md">
            <div v-for="reminder in (showAll ? filteredReminders : filteredReminders.slice(0, 3))"
              :key="reminder.SIFRA_PODSJETNIKA"
              class="reminder-card col-xs-12 col-sm-6 col-md-4">
              <q-card-section class="text-left">
                <h3 class="reminder-title flex items-center">
                  <q-icon name="notifications" class="q-mr-sm" />
                  <q-input v-if="reminder.editMode" v-model="reminder.naziv_podsjetnika" dense outlined />
                  <span v-else>{{ reminder.naziv_podsjetnika }}</span>
                </h3>

                <p v-if="!reminder.editMode" class="reminder-description q-mt-xs text-grey-8">
                  {{ reminder.opis_podsjetnika }}
                </p>

                <p class="reminder-datetime flex items-center q-mt-sm">
                  <q-icon name="event" class="q-mr-sm" />
                  <q-input v-if="reminder.editMode" v-model="reminder.datum_podsjetnika_input" dense outlined type="date" />
                  <span v-else>{{ formatCroatianDate(reminder.datum_podsjetnika) }} u {{ reminder.vrijeme_podsjetnika }}</span>
                </p>

                <p class="reminder-type text-bold q-mt-xs">
                  <q-icon name="event_note" class="q-mr-sm" />
                  {{ reminder.tip_podsjetnika }}
                </p>

                <q-input v-if="reminder.editMode" v-model="reminder.vrijeme_podsjetnika" type="time" dense outlined
                  class="q-mt-sm" />
                <q-input v-if="reminder.editMode" v-model="reminder.opis_podsjetnika" dense outlined class="q-mt-sm" />

                <q-select v-if="reminder.editMode" v-model="reminder.tip_podsjetnika"
                  :options="['dogadaj', 'termin', 'privatno']" label="Tip podsjetnika" outlined dense />

                <div class="reminder-actions q-mt-md flex justify-around">
                  <q-btn flat dense icon="edit" :label="reminder.editMode ? 'Spremi' : 'Uredi'" color="primary"
                    @click="toggleEdit(reminder)" />
                  <q-btn flat dense icon="delete" label="Obriši" color="negative"
                    @click="deleteReminder(reminder.SIFRA_PODSJETNIKA)" />
                </div>
              </q-card-section>
            </div>
          </div>
        </div>

        <div class="q-mt-lg text-center">
          <q-btn v-if="filteredReminders.length > 3" @click="toggleShowAll" flat color="primary">
            {{ showAll ? 'Prikaži manje' : 'Prikaži više' }}
          </q-btn>
        </div>
      </div>
      <div v-else class="text-center q-pa-md">
        <p class="text-h6 text-grey-7">Nema pronađenih podsjetnika.</p>
        <p class="text-grey-6">Dodajte novi podsjetnik ili prilagodite pretragu.</p>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const reminders = ref([]);
const showAll = ref(false);
const searchQuery = ref('');
const router = useRouter();
const userStore = useUserStore();

// Funkcija za formatiranje datuma u DD.MM.YYYY.
const formatCroatianDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}.${month}.${year}.`;
};

// Filtriranje podsjetnika
const filteredReminders = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return reminders.value.filter(reminder =>
    reminder.naziv_podsjetnika.toLowerCase().includes(query) ||
    formatCroatianDate(reminder.datum_podsjetnika).includes(query) || // Pretraga po formatiranom datumu
    reminder.vrijeme_podsjetnika.includes(query) ||
    reminder.tip_podsjetnika.toLowerCase().includes(query)
  );
});

// Prikaži više/manje podsjetnika
function toggleShowAll() {
  showAll.value = !showAll.value;
}

// Dohvaćanje podsjetnika
async function fetchReminders() {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/prijava');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/podsjetnici', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      userStore.clearUser();
      router.push('/prijava');
      return [];
    }

    if (!res.ok) {
      throw new Error(`Greška pri dohvaćanju: ${res.statusText}`);
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("API nije vratio niz podsjetnika!");
    }

    reminders.value = data.map(reminder => ({
      ...reminder,
      editMode: false,
      // Dodajemo pomoćno polje za input type="date" koje očekuje YYYY-MM-DD
      datum_podsjetnika_input: reminder.datum_podsjetnika
    }));

  } catch (err) {
    console.error("Greška pri dohvaćanju podsjetnika:", err);
  }
}

// Omogućivanje uređivanja podsjetnika i spremanje
async function toggleEdit(reminder) {
  if (reminder.editMode) {
    // Prije slanja na backend, osiguraj da je datum u YYYY-MM-DD formatu
    // q-input type="date" već daje YYYY-MM-DD pa samo koristimo tu vrijednost
    reminder.datum_podsjetnika = reminder.datum_podsjetnika_input;
    console.log("➡️ Tip podsjetnika prije slanja PUT-a:", reminder.tip_podsjetnika);
    await updateReminder(reminder);
    await fetchReminders();
  } else {
    // Kada ulazimo u edit mode, sinkroniziraj datum za input polje
    reminder.datum_podsjetnika_input = reminder.datum_podsjetnika;
  }
  reminder.editMode = !reminder.editMode;
}

// Ažuriranje podsjetnika
async function updateReminder(reminder) {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/prijava');
    return;
  }

  // Datum je već u YYYY-MM-DD formatu iz q-input type="date" (datum_podsjetnika_input)
  // ili izravno iz baze ako nismo mijenjali
  const datumZaBackend = reminder.datum_podsjetnika_input || reminder.datum_podsjetnika;

  const requestBody = {
    naziv_podsjetnika: reminder.naziv_podsjetnika,
    opis_podsjetnika: reminder.opis_podsjetnika,
    datum_podsjetnika: datumZaBackend, // Slanje u YYYY-MM-DD formatu
    vrijeme_podsjetnika: reminder.vrijeme_podsjetnika,
    tip_podsjetnika: reminder.tip_podsjetnika
  };

  try {
    const response = await fetch(`http://localhost:3000/podsjetnici/${reminder.SIFRA_PODSJETNIKA}`, {
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
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Greška servera: ${errorData.poruka || response.statusText}`);
    }

    console.log("Podsjetnik uspješno ažuriran.");
  } catch (err) {
    console.error("Greška pri ažuriranju:", err);
  }
}

// Brisanje podsjetnika
async function deleteReminder(id) {
  if (confirm('Jeste li sigurni da želite obrisati ovaj podsjetnik?')) {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/prijava');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/podsjetnici/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        userStore.clearUser();
        router.push('/prijava');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Greška servera: ${errorData.poruka || response.statusText}`);
      }

      console.log(`✅ Podsjetnik s ID ${id} uspješno obrisan.`);
      await fetchReminders();
    } catch (err) {
      console.error('Greška pri brisanju podsjetnika:', err);
    }
  }
}

onMounted(fetchReminders);
</script>

<style scoped>
/* Vaši postojeći stilovi ostaju nepromijenjeni */
.reminders-page {
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

.reminder-datetime {
  font-size: 1em;
  color: gray;
}

.reminder-actions .q-btn {
  min-width: unset;
}

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
