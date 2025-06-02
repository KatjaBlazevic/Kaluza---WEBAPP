<template>
  <q-page class="q-pa-lg">
    <q-card class="q-pa-md q-mx-auto" style="max-width: 500px">
      <q-card-section>
        <div class="text-h4 podsjetnik-title">Dodaj unos u dnevnik</div>
      </q-card-section>

      <q-form @submit.prevent="submitEntry">
        <q-card-section class="q-gutter-md">
          <q-input v-model="entry.naziv_zapisa" label="Naziv zapisa" filled required />
          <q-input v-model="entry.tekst_zapisa" label="Tekst zapisa" filled type="textarea" />

          </q-card-section>

        <q-card-actions align="center">
          <q-btn label="Spremi unos" type="submit" color="primary" />
        </q-card-actions>
      </q-form>

      <q-card-section v-if="statusPoruka" class="text-center">
        <div
          :class="{
            'text-positive': statusBoja === 'green',
            'text-negative': statusBoja === 'red'
          }"
          class="text-subtitle2 q-mt-md"
        >
          {{ statusPoruka }}
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

// Funkcija za dohvaćanje trenutnog datuma u formatu YYYY-MM-DD
function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Mjeseci su 0-bazirani
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Funkcija za dohvaćanje trenutnog vremena u formatu HH:MM
function getCurrentTime() {
  const today = new Date();
  const hours = String(today.getHours()).padStart(2, '0');
  const minutes = String(today.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

const entry = ref({
  naziv_zapisa: '',
  tekst_zapisa: '',
  // ✅ Inicijalizacija datum_zapisa i vrijeme_zapisa s trenutnim vrijednostima
  datum_zapisa: getCurrentDate(),
  vrijeme_zapisa: getCurrentTime()
});

const statusPoruka = ref('');
const statusBoja = ref('');

// Dohvati profil korisnika prilikom učitavanja stranice
const fetchUserProfile = async () => {
  try {
    const res = await fetch('http://localhost:3000/profile', {
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Neuspješno dohvaćanje korisnika.');

    const data = await res.json();
    console.log('Dohvaćen korisnik:', data);

    userStore.setUser({
      ...data,
      SIFRA_KORISNIKA: data.SIFRA_KORISNIKA
    });
  } catch (err) {
    console.error('Greška pri dohvaćanju profila:', err);
    statusPoruka.value = 'Greška pri dohvaćanju korisničkog profila.';
    statusBoja.value = 'red';
  }
};

onMounted(fetchUserProfile);

function resetForm() {
  entry.value = {
    naziv_zapisa: '',
    tekst_zapisa: '',
    // ✅ Opet inicijalizacija s trenutnim datumom/vremenom nakon resetiranja
    datum_zapisa: getCurrentDate(),
    vrijeme_zapisa: getCurrentTime()
  };
  statusPoruka.value = '';
  statusBoja.value = '';
}

async function submitEntry() {
  if (!userStore.SIFRA_KORISNIKA) {
    console.error('Greška: Korisnik nije prijavljen ili nema SIFRA_KORISNIKA.');
    statusPoruka.value = 'Greška: Korisnik nije prijavljen.';
    statusBoja.value = 'red';
    return;
  }

  try {
    const podaciZaDnevnik = {
      naziv_zapisa: entry.value.naziv_zapisa,
      tekst_zapisa: entry.value.tekst_zapisa,
      // ✅ Slanje automatski generiranih datuma i vremena
      datum_zapisa: entry.value.datum_zapisa,
      vrijeme_zapisa: entry.value.vrijeme_zapisa,
      SIFRA_KORISNIKA: userStore.SIFRA_KORISNIKA
    };

    const res = await fetch('http://localhost:3000/dnevnik', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(podaciZaDnevnik)
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.poruka || 'Greška pri dodavanju unosa u dnevnik.');
    }

    statusPoruka.value = 'Unos u dnevnik uspješno dodan!';
    statusBoja.value = 'green';
    resetForm();
    router.push('/dnevnik');
  } catch (e) {
    console.error('Greška pri dodavanju unosa u dnevnik:', e);
    statusPoruka.value = e.message;
    statusBoja.value = 'red';
  }
}
</script>

<style scoped>
.podsjetnik-title{
    color: var(--q-primary);
    font-weight: bold;
    text-align: center;
}
</style>
