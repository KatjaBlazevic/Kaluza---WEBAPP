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
const statusBoja = ref('')

const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/prijava');
      return;
    }

    const res = await fetch('http://localhost:3000/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      localStorage.removeItem('token');
      userStore.clearUser();
      router.push('/prijava');
      throw new Error('Neuspješno dohvaćanje korisnika ili nevažeći token.');
    }

    const data = await res.json();
    userStore.setUser(data);

  } catch (err) {
    console.error('Greška pri dohvaćanju profila za DodajLjubimca:', err);
    statusPoruka.value = 'Greška pri dohvaćanju korisničkog profila.';
    statusBoja.value = 'red';
    localStorage.removeItem('token');
    userStore.clearUser();
    router.push('/prijava');
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
  if (!userStore.id) {
    console.error('Greška: Korisnik nije prijavljen ili ID korisnika nije dostupan u storeu.');
    statusPoruka.value = 'Greška: Korisnik nije prijavljen ili ID nije dostupan. Pokušajte se ponovno prijaviti.';
    statusBoja.value = 'red';
    router.push('/prijava');
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
      SIFRA_KORISNIKA: userStore.id
    };

    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Nema JWT tokena za autorizaciju prilikom dodavanja ljubimca.');
    }

    const res = await fetch('http://localhost:3000/ljubimci', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(podaciZaLjubimca)
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.poruka || 'Greška pri dodavanju ljubimca.');
    }

    statusPoruka.value = 'Ljubimac uspješno dodan!';
    statusBoja.value = 'green';
    resetForm();
    router.push('/profile');
  } catch (e) {
    console.error('Greška pri dodavanju ljubimca:', e);
    statusPoruka.value = e.message;
    statusBoja.value = 'red';
    if (e.message.includes('token') || e.message.includes('autorizaciju')) {
        localStorage.removeItem('token');
        userStore.clearUser();
        router.push('/prijava');
    }
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
