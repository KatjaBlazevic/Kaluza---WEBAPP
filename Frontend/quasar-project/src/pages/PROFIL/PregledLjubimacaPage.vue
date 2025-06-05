<template>
  <q-page class="q-pa-lg">
    <div v-if="loading" class="text-center q-pa-md">
      Učitavanje podataka...
    </div>

    <div v-else>
      <h1 class="text-h4 text-center title">Tvoji ljubimci</h1>

      <div v-if="ljubimci.length === 0" class="text-center q-pa-md">
        Trenutno nemaš dodanih ljubimaca.
      </div>

      <q-list v-if="ljubimci.length > 0" bordered separator class="q-mt-md">
        <q-item v-for="ljubimac in ljubimci" :key="ljubimac.SIFRA_LJUBIMCA">
          <q-item-section>
            <q-item-label class="text-h6">{{ ljubimac.ime_ljubimca }} ({{ ljubimac.vrsta_ljubimca }})</q-item-label>
            <q-item-label caption>Datum rođenja: {{ ljubimac.datum_rodenja_ljubimca }}</q-item-label>
            <q-item-label caption>Kilaža: {{ ljubimac.kilaza_ljubimca }} kg</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-btn label="Uredi" color="accent" class="action-btn1" @click="urediLjubimca(ljubimac.SIFRA_LJUBIMCA)" />
            <q-btn label="Obriši" color="accent" class="action-btn2" @click="obrisiLjubimca(ljubimac.SIFRA_LJUBIMCA)" />
          </q-item-section>
        </q-item>
      </q-list>

      <div class="text-center q-mt-lg">
        <q-btn label="Dodaj novog ljubimca" color="primary" to="/dodaj-ljubimca" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const loading = ref(true);
const ljubimci = ref([]);
const userStore = useUserStore();

async function fetchLjubimci() {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/prijava');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/moji-ljubimci', {
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
      throw new Error('Neuspješno dohvaćanje ljubimaca.');
    }

    ljubimci.value = await res.json();
  } catch (err) {
    console.error('Greška pri dohvaćanju ljubimaca:', err);
  } finally {
    loading.value = false;
  }
}

function urediLjubimca(id) {
  router.push(`/uredi-ljubimca/${id}`);
}

async function obrisiLjubimca(id) {
  if (!confirm('Jeste li sigurni da želite obrisati ovog ljubimca?')) {
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/prijava');
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/obrisi-ljubimca/${id}`, {
      method: 'DELETE',
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
      throw new Error(errorData.poruka || 'Neuspješno brisanje ljubimca.');
    }

    ljubimci.value = ljubimci.value.filter(l => l.SIFRA_LJUBIMCA !== id);
    console.log('Ljubimac uspješno obrisan');
  } catch (err) {
    console.error('Greška pri brisanju ljubimca:', err);
    alert(err.message); // Prikaz poruke korisniku
  }
}

onMounted(fetchLjubimci);
</script>

<style scoped>
.q-page {
  background-color: white;
}

.q-list {
  max-width: 600px;
  margin: 0 auto;
}

.title{
  color: var(--q-primary);
  font-weight: bold;
  margin-bottom: 2.5rem;
}

.action-btn1 {
  border-radius: 10px;
  padding: 10px 20px;
  font-weight: bold;
  margin-bottom: 1rem;
}

.action-btn2 {
  border-radius: 10px;
  padding: 10px 20px;
  font-weight: bold;
}
</style>
