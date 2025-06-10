<template>
  <q-page class="q-pa-lg">
    <q-card class="q-pa-md q-mx-auto" style="max-width: 500px; width: 100%;">
      <q-card-section>
        <div class="text-h4 izradaprofila-title">Dovrši izradu profila</div>
      </q-card-section>

      <q-form @submit.prevent="submitProfile">
        <q-card-section class="q-gutter-md">
          <q-input v-model="nadimak" label="Nadimak" filled required />
          <q-input v-model="adresa" label="Adresa" filled />
          <q-input v-model="mjesto" label="Mjesto stanovanja" filled />
          <q-input v-model="datumRodenja" label="Datum rođenja" type="date" filled />
          <q-input v-model="brojTelefona" label="Broj telefona" type="tel" filled />
        </q-card-section>

        <q-card-actions align="center">
          <q-btn type="submit" label="Spremi profil" color="primary" :loading="loading" />
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
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// ✅ userId mora biti dohvaćen, i osiguraj da postoji prije nego što nastaviš
const userId = route.query.userId;

// Ako userId ne postoji, preusmjeri odmah natrag
if (!userId) {
  console.error('IzradaProfilaPage: ID korisnika nije pronađen u URL-u, preusmjeravam na registraciju.');
  router.replace('/register'); // ILI /registracija ako ti je tako ruta definirana
}

const nadimak = ref('');
const adresa = ref('');
const mjesto = ref('');
const datumRodenja = ref('');
const brojTelefona = ref('');

const loading = ref(false);
const successMsg = ref('');
const errorMsg = ref('');

const submitProfile = async () => {
  loading.value = true;
  successMsg.value = '';
  errorMsg.value = '';

  try {
    const response = await fetch('http://localhost:3000/izrada-profila', {
      method: 'PUT', // Ako ažuriraš, PUT je prikladniji. Ako kreiraš, POST.
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId, // Koristimo userId iz query parametra
        nadimak: nadimak.value,
        adresa: adresa.value,
        mjesto: mjesto.value,
        datumRodenja: datumRodenja.value,
        brojTelefona: brojTelefona.value
      })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Greška prilikom ažuriranja profila.');
    }

    // Backend za /izrada-profila NE MORA vratiti userId, jer ga već imamo.
    // Jednostavno ga proslijedimo dalje.
    successMsg.value = 'Profil uspješno ažuriran!';
    console.log('IzradaProfilaPage: Profil ažuriran. Preusmjeravam na /dodaj-ljubimca s userId:', userId);

    // ✅ KLJUČNA PROMJENA: Prosljeđujemo userId u query parametru
    setTimeout(() => {
      router.push({ path: '/dodaj-ljubimca', query: { userId: userId } });
    }, 500);

  } catch (err) {
    console.error('IzradaProfilaPage: Greška pri ažuriranju profila:', err);
    errorMsg.value = err.message || 'Greška prilikom slanja podataka.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.q-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
.izradaprofila-title {
  color: var(--q-primary);
  font-weight: bold;
  text-align: center;
}
</style>
