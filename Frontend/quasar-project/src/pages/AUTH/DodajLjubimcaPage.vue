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
import { ref } from 'vue'; // Uklonjen onMounted jer ne dohvaćamo profil ovdje
import { useRoute, useRouter } from 'vue-router'; // Dodan useRoute
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();
const route = useRoute(); // Inicijaliziraj useRoute

// ✅ Dohvaćanje userId iz query parametra
const userId = ref(route.query.userId || null);

// Ako userId nije prisutan, nešto je pošlo po zlu u prethodnom koraku
if (!userId.value) {
  console.error('Greška: ID korisnika nije pronađen u URL-u za dodavanje ljubimca.');
  // Preusmjeri korisnika natrag na početak registracije ili prijavu
  router.replace('/registracija'); // Ili na /prijava
}

const pet = ref({
  ime: '',
  vrsta: '',
  datum_rodenja: '',
  kilaza: '',
  njega: '',
  prehrana: ''
});

const vrste = ['Pas', 'Mačka', 'Zec', 'Papiga', 'Zmija', 'Ribica'];

const statusPoruka = ref('');
const statusBoja = ref('');

// ❌ UKLONJENA fetchUserProfile i onMounted(fetchUserProfile)
// Jer se JWT token generira tek u ovom koraku, nakon spremanja ljubimca.
// Korisnik još nije "prijavljen" na frontendu.

function resetForm() {
  pet.value = {
    ime: '',
    vrsta: '',
    datum_rodenja: '',
    kilaza: '',
    njega: '',
    prehrana: ''
  };
  statusPoruka.value = '';
  statusBoja.value = '';
}

async function submitPet() {
  // ✅ Koristi userId iz query parametra, NE iz userStore-a
  if (!userId.value) {
    console.error('Greška: ID korisnika nedostaje za dodavanje ljubimca.');
    statusPoruka.value = 'Greška: ID korisnika nedostaje. Molimo pokušajte ponovno.';
    statusBoja.value = 'red';
    // Opcionalno, preusmjeri na početak registracije
    router.push('/registracija');
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
      SIFRA_KORISNIKA: userId.value // ✅ Prosljeđujemo userId s prethodnih koraka
    };

    // ❌ Nema potrebe za tokenom za ovaj POST zahtjev, backend ga tek generira
    const res = await fetch('http://localhost:3000/ljubimci', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}` // ❌ UKLONJENO - token se generira na backendu u ovom koraku
      },
      body: JSON.stringify(podaciZaLjubimca)
    });

    const data = await res.json(); // Uvijek parsiraj JSON odgovor

    if (!res.ok) {
      throw new Error(data.poruka || 'Greška pri dodavanju ljubimca.');
    }

    statusPoruka.value = data.poruka; // Poruka s backenda
    statusBoja.value = 'green';
    resetForm();

    // ✅ OVDJE POHRANI TOKEN I KORISNIKA U STORE
    if (data.token && data.user) {
      localStorage.setItem('token', data.token);
      userStore.setUser(data.user); // userStore.setUser očekuje objekt s id, ime, prezime, role, email, nadimak
      console.log('Korisnik uspješno prijavljen nakon registracije i dodavanja ljubimca!');
      router.push('/profile'); // ✅ Preusmjeri na profil nakon uspješne prijave
    } else {
      // Ako backend nije vratio token/user (što ne bi trebao biti slučaj prema našem planu)
      statusPoruka.value = 'Ljubimac dodan, ali nije moguće automatski prijaviti korisnika.';
      statusBoja.value = 'red';
      router.push('/prijava'); // Ako se ne može prijaviti automatski, neka se prijavi ručno
    }

  } catch (e) {
    console.error('Greška pri dodavanju ljubimca:', e);
    statusPoruka.value = e.message;
    statusBoja.value = 'red';

  }
}
</script>

<style scoped>
.ljubimac-title {
  color: var(--q-primary);
  font-weight: bold;
  text-align: center;
}
</style>
