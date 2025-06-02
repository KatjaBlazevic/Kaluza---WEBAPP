<template>
  <q-page class="q-pa-lg">
    <q-card class="q-pa-md q-mx-auto" style="max-width: 500px">
      <q-card-section>
        <div class="text-h4 podsjetnik-title">Dodaj podsjetnik</div>
      </q-card-section>

      <q-form @submit.prevent="submitReminder">
        <q-card-section class="q-gutter-md">
          <q-input v-model="reminder.naziv_podsjetnika" label="Naziv podsjetnika" filled required />
          <q-input v-model="reminder.opis_podsjetnika" label="Opis" filled type="textarea"/>
          <q-input v-model="reminder.datum_podsjetnika" type="date" label="Datum" filled required/>
          <q-input v-model="reminder.vrijeme_podsjetnika" type="time" label="Vrijeme" filled required/>
          <q-select v-model="reminder.tip_podsjetnika" :options="['dogadaj', 'termin', 'privatno']" label="Tip podsjetnika" filled/>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn label="Spremi podsjetnik" type="submit" color="primary" />
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const reminder = ref({
  naziv_podsjetnika: '',
  opis_podsjetnika: '',
  datum_podsjetnika: '',
  vrijeme_podsjetnika: '',
  tip_podsjetnika: ''
})

const statusPoruka = ref('')
const statusBoja = ref('')

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
  reminder.value = {
    naziv_podsjetnika: '',
    opis_podsjetnika: '',
    datum_podsjetnika: '',
    vrijeme_podsjetnika: '',
    tip_podsjetnika: ''
  }
  statusPoruka.value = ''
  statusBoja.value = ''
}

async function submitReminder() {
  if (!userStore.SIFRA_KORISNIKA) {
    console.error('Greška: Korisnik nije prijavljen ili nema SIFRA_KORISNIKA.');
    statusPoruka.value = 'Greška: Korisnik nije prijavljen.';
    statusBoja.value = 'red';
    return;
  }

  try {
    const podaciZaPodsjetnik = {
      naziv_podsjetnika: reminder.value.naziv_podsjetnika,
      opis_podsjetnika: reminder.value.opis_podsjetnika,
      datum_podsjetnika: reminder.value.datum_podsjetnika,
      vrijeme_podsjetnika: reminder.value.vrijeme_podsjetnika,
      tip_podsjetnika: reminder.value.tip_podsjetnika,
      SIFRA_KORISNIKA: userStore.SIFRA_KORISNIKA
    };

    const res = await fetch('http://localhost:3000/podsjetnici', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(podaciZaPodsjetnik)
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.poruka || 'Greška pri dodavanju podsjetnika.');
    }

    statusPoruka.value = 'Podsjetnik uspješno dodan!';
    statusBoja.value = 'green';
    resetForm();
    router.push('/podsjetnici');
  } catch (e) {
    console.error('Greška pri dodavanju podsjetnika:', e);
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
