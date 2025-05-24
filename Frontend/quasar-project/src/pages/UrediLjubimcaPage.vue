<template>
  <q-page class="q-pa-lg">
    <q-card class="q-pa-md q-mx-auto" style="max-width: 500px">
      <q-card-section>
        <div class="text-h4 ljubimac-title">Uredi ljubimca</div>
      </q-card-section>

      <q-form @submit="spremiIzmjene">
        <q-card-section class="q-gutter-md">
          <q-input v-model="ljubimac.ime_ljubimca" label="Ime ljubimca" filled required />
          <q-select v-model="ljubimac.vrsta_ljubimca" :options="vrste" label="Vrsta ljubimca" filled required />
          <q-input v-model="ljubimac.datum_rodenja_ljubimca" type="date" label="Datum rođenja" filled required />
          <q-input v-model="ljubimac.kilaza_ljubimca" type="number" step="0.01" label="Kilaža" filled />
          <q-input v-model="ljubimac.podaci_o_njezi_ljubimca" label="Podaci o njezi" filled type="textarea" />
          <q-input v-model="ljubimac.podaci_o_prehrani_ljubimca" label="Podaci o prehrani" filled type="textarea" />
        </q-card-section>

        <q-card-actions align="center">
          <q-btn label="Spremi izmjene" type="submit" color="primary" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const loading = ref(true);
const ljubimac = ref({});

//Dohvati podatke ljubimca na temelju ID-a
async function fetchLjubimac() {
  try {
    const res = await fetch(`http://localhost:3000/ljubimac/${route.params.id}`, {
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Greška pri dohvaćanju ljubimca.');

    ljubimac.value = await res.json();
  } catch (err) {
    console.error('Greška pri dohvaćanju ljubimca:', err);
  } finally {
    loading.value = false;
  }
}

async function spremiIzmjene() {
  //Ne šalju se prazni podaci
  const podaciZaSlanje = {
    ime_ljubimca: ljubimac.value.ime_ljubimca || '',
    vrsta_ljubimca: ljubimac.value.vrsta_ljubimca || '',
    datum_rodenja_ljubimca: ljubimac.value.datum_rodenja_ljubimca || '',
    kilaza_ljubimca: ljubimac.value.kilaza_ljubimca || '',
    podaci_o_njezi_ljubimca: ljubimac.value.podaci_o_njezi_ljubimca || '',
    podaci_o_prehrani_ljubimca: ljubimac.value.podaci_o_prehrani_ljubimca || ''
  };

  await fetch(`http://localhost:3000/uredi-ljubimca/${route.params.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(podaciZaSlanje)
  });

  router.push('/pregled-ljubimaca');
}

onMounted(fetchLjubimac);
</script>

<style scoped>
.ljubimac-title {
  color: var(--q-primary);
  font-weight: bold;
  text-align: center;
}
</style>
