<template>
  <q-page class="q-pa-lg">
    <q-card class="q-pa-md q-mx-auto" style="max-width: 500px; width: 100%;">

      <q-card-section>
        <div class="text-h4 dodaj-sliku-title">Dodaj novu sliku</div>
      </q-card-section>

      <q-form @submit.prevent="submitImage">
        <q-card-section class="q-gutter-md">
          <q-input v-model="naziv_slike" label="Naziv slike" filled required />
          <q-input v-model="opis_slike" label="Opis slike" filled type="textarea" />
          <q-file v-model="slika" label="Odaberi sliku" accept=".jpg, .png" filled required />
        </q-card-section>

        <q-card-actions align="center">
          <q-btn type="submit" label="Dodaj sliku" color="primary" :loading="loading" />
        </q-card-actions>
      </q-form>

      <q-card-section v-if="successMsg || errorMsg" class="text-center">
        <div
          :class="{
            'text-positive': successMsg,
            'text-negative': errorMsg
          }"
          class="text-subtitle2 q-mt-md"
        >
          {{ successMsg || errorMsg }}
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'; // Dodano za preusmjeravanje
import { useUserStore } from '@/stores/user'; // Dodano za pristup userStore-u

const naziv_slike = ref('');
const opis_slike = ref('');
const slika = ref(null);
const loading = ref(false);
const successMsg = ref('');
const errorMsg = ref('');

const router = useRouter(); // Inicijalizacija routera
const userStore = useUserStore(); // Inicijalizacija userStore-a

// Funkcija formatirajDatum nije direktno potrebna u ovom frontend kodu
// jer se datum generira na backendu, ali ju ostavljam ako je koristite negdje drugdje.
function formatirajDatum(isoDate) {
  const date = new Date(isoDate);
  const dan = String(date.getDate()).padStart(2, '0');
  const mjesec = String(date.getMonth() + 1).padStart(2, '0'); // Mjeseci počinju od 0
  const godina = date.getFullYear();
  return `<span class="math-inline">\{dan\}\.</span>{mjesec}.${godina}.`;
}

async function submitImage() {
  loading.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/prijava');
    loading.value = false;
    return;
  }

  const formData = new FormData();
  formData.append('naziv_slike', naziv_slike.value);
  formData.append('opis_slike', opis_slike.value);
  // Provjeri je li slika odabrana
  if (slika.value) {
    formData.append('slika', slika.value);
  } else {
    errorMsg.value = 'Molimo odaberite sliku za upload.';
    loading.value = false;
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/dodaj-sliku', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}` // Slanje JWT tokena
      },
      body: formData,
      // 'Content-Type': 'multipart/form-data' ne treba eksplicitno postavljati
      // kada koristite FormData, preglednik to automatski postavlja
    });

    // Rukovanje neautoriziranim pristupom
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      userStore.clearUser();
      router.push('/prijava');
      return;
    }

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.poruka || 'Greška pri dodavanju slike.');
    }

    successMsg.value = '✅ Slika uspješno dodana!';
    naziv_slike.value = '';
    opis_slike.value = '';
    slika.value = null; // Resetira odabrani file
  } catch (e) {
    errorMsg.value = e.message;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.q-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* Centrirano na ekranu */
  min-height: 100vh; /* Osigurava da stranica zauzima cijeli ekran */
}

.dodaj-sliku-title {
  color: var(--q-primary);
  font-weight: bold;
  text-align: center;
}
</style>
