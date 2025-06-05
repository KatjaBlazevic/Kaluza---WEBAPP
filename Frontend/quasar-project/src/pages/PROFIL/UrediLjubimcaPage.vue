<template>
  <q-page class="q-pa-lg">
    <q-card class="q-pa-md q-mx-auto" style="max-width: 500px">
      <q-card-section>
        <div class="text-h4 ljubimac-title">Uredi ljubimca</div>
      </q-card-section>

      <q-form @submit.prevent="spremiIzmjene">
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
      <div v-if="statusPoruka" :class="statusBoja === 'green' ? 'text-positive' : 'text-negative'" class="q-mt-md text-center">
        {{ statusPoruka }}
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const ljubimac = ref({});
const statusPoruka = ref('');
const statusBoja = ref('');

const vrste = ['Pas', 'Mačka', 'Zec', 'Papiga', 'Zmija', 'Ribica'];

async function fetchLjubimac() {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/prijava');
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/ljubimac/${route.params.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      userStore.clearUser();
      router.push('/prijava');
      return;
    }

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.poruka || 'Greška pri dohvaćanju ljubimca.');
    }

    ljubimac.value = await res.json();
    // Formatiranje datuma za q-input type="date"
    if (ljubimac.value.datum_rodenja_ljubimca) {
      const date = new Date(ljubimac.value.datum_rodenja_ljubimca);
      ljubimac.value.datum_rodenja_ljubimca = date.toISOString().split('T')[0];
    }
  } catch (err) {
    console.error('Greška pri dohvaćanju ljubimca:', err);
    statusPoruka.value = err.message;
    statusBoja.value = 'red';
  }
}

async function spremiIzmjene() {
  statusPoruka.value = '';
  statusBoja.value = '';

  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/prijava');
    return;
  }

  try {
    const podaciZaSlanje = {
      ime_ljubimca: ljubimac.value.ime_ljubimca,
      vrsta_ljubimca: ljubimac.value.vrsta_ljubimca,
      datum_rodenja_ljubimca: ljubimac.value.datum_rodenja_ljubimca,
      kilaza_ljubimca: parseFloat(ljubimac.value.kilaza_ljubimca),
      podaci_o_njezi_ljubimca: ljubimac.value.podaci_o_njezi_ljubimca,
      podaci_o_prehrani_ljubimca: ljubimac.value.podaci_o_prehrani_ljubimca
    };

    const res = await fetch(`http://localhost:3000/uredi-ljubimca/${route.params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(podaciZaSlanje)
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      userStore.clearUser();
      router.push('/prijava');
      return;
    }

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.poruka || 'Greška pri spremanju izmjena.');
    }

    statusPoruka.value = 'Ljubimac uspješno ažuriran!';
    statusBoja.value = 'green';
    router.push('/pregled-ljubimaca'); // Preusmjeri nakon uspješnog ažuriranja
  } catch (err) {
    console.error('Greška pri spremanju izmjena:', err);
    statusPoruka.value = err.message;
    statusBoja.value = 'red';
  }
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
