<template>
  <q-page class="q-pa-lg">
    <q-card class="q-pa-md q-mx-auto" style="max-width: 500px">
      <q-card-section>
        <div class="text-h4 ljubimac-title">Dodaj ljubimca</div>
      </q-card-section>

      <q-form @submit.prevent="submitPet">
        <q-card-section class="q-gutter-md">
          <q-input v-model="pet.ime" label="Ime ljubimca" filled required />
          <q-select v-model="pet.vrsta" :options="vrste" label="Vrsta ljubimca" filled/>
          <q-input v-model="pet.datum_rodenja" type="date" label="Datum rođenja" filled required/>
          <q-input v-model="pet.kilaza" type="number" step="0.01" label="Kilaža" filled/>
          <q-input v-model="pet.njega" label="Podaci o njezi" filled type="textarea"/>
          <q-input v-model="pet.prehrana" label="Podaci o prehrani" filled type="textarea"/>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn label="Spremi ljubimca" type="submit" color="primary" />
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

const pet = ref({
  ime: '',
  vrsta: '',
  datum_rodenja: '',
  kilaza: '',
  njega: '',
  prehrana: ''
})

const vrste = ['Pas', 'Mačka', 'Zec', 'Papiga', 'Zmija', 'Ribica']

const statusPoruka = ref('')
const statusBoja = ref('') // 'green' za uspjeh, 'red' za grešku

// Dohvati profil korisnika prilikom učitavanja stranice
const fetchUserProfile = async () => {
  try {
    const res = await fetch('http://localhost:3000/profile', {
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Neuspješno dohvaćanje korisnika.');

    const data = await res.json();
    console.log('Dohvaćen korisnik:', data); // Debug konzola

    userStore.setUser({
      ...data,
      SIFRA_KORISNIKA: data.SIFRA_KORISNIKA // Osiguraj da postoji ispravno
    });
  } catch (err) {
    console.error('Greška pri dohvaćanju profila:', err);
    statusPoruka.value = 'Greška pri dohvaćanju korisničkog profila.';
    statusBoja.value = 'red';
  }
};

onMounted(fetchUserProfile);

function resetForm() {
  pet.value = {
    ime: '',
    vrsta: '',
    datum_rodenja: '',
    kilaza: '',
    njega: '',
    prehrana: ''
  }
  statusPoruka.value = ''
  statusBoja.value = ''
}

async function submitPet() {
  if (!userStore.SIFRA_KORISNIKA) {
    console.error('Greška: Korisnik nije prijavljen ili nema SIFRA_KORISNIKA.');
    statusPoruka.value = 'Greška: Korisnik nije prijavljen.';
    statusBoja.value = 'red';
    return;
  }

  try {
    const podaciZaLjubimca = {
      ime_ljubimca: pet.value.ime,
      vrsta_ljubimca: pet.value.vrsta,
      datum_rodenja_ljubimca: pet.value.datum_rodenja,
      kilaza_ljubimca: parseFloat(pet.value.kilaza),
      podaci_o_njezi_ljubimca: pet.value.njega,
      podaci_o_prehrani_ljubimca: pet.value.prehrana,
      SIFRA_KORISNIKA: userStore.SIFRA_KORISNIKA
    };

    const res = await fetch('http://localhost:3000/ljubimci', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(podaciZaLjubimca)
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.poruka || 'Greška pri dodavanju ljubimca.');
    }

    statusPoruka.value = 'Ljubimac uspješno dodan!';
    statusBoja.value = 'green';
    resetForm();
  } catch (e) {
    console.error('Greška pri dodavanju ljubimca:', e);
    statusPoruka.value = e.message;
    statusBoja.value = 'red';
  }
}

</script>

<style scoped>
.ljubimac-title{
    color: var(--q-primary);
  font-weight: bold;
text-align: center;
}

</style>
