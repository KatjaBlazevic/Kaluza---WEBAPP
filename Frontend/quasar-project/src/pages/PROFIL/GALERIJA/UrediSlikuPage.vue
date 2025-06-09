<template>
  <q-page class="uredi-sliku-page">
    <q-card v-if="imageData" class="image-form">
      <q-card-section>
        <h2 class="form-title">Uredi sliku</h2>

        <q-input v-model="imageData.naziv_slike" label="Naziv slike" outlined class="q-mb-md" />
        <q-input v-model="imageData.opis_slike" label="Opis slike" outlined type="textarea" class="q-mb-md" />

        <div class="buttons">
          <q-btn label="Spremi promjene" color="primary" @click="updateImage" />
        </div>
      </q-card-section>

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
    <div v-else class="loading text-center">
      <p class="text-h6 text-dark">🔄 Učitavanje podataka za uređivanje...</p>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const imageData = ref(null);
const userStore = useUserStore();

// Dodane reference za poruke o uspjehu/grešci
const successMsg = ref('');
const errorMsg = ref('');

const fetchImage = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/prijava');
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/slika/${route.params.SIFRA_SLIKE}`, {
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
      const data = await res.json();
      throw new Error(data.poruka || 'Slika nije pronađena.');
    }

    imageData.value = await res.json();
  } catch (err) {
    console.error('Greška pri dohvaćanju slike za uređivanje:', err);
    errorMsg.value = err.message || 'Došlo je do greške prilikom dohvaćanja slike.';
    // Ne preusmjeravamo odmah na galeriju, već prikazujemo poruku
    // router.push('/galerija'); // Opcionalno, ako želiš preusmjeriti čak i s greškom
  }
};

const updateImage = async () => {
  // Resetiraj poruke prije novog pokušaja
  successMsg.value = '';
  errorMsg.value = '';

  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/prijava');
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/slika/${route.params.SIFRA_SLIKE}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        naziv_slike: imageData.value.naziv_slike,
        opis_slike: imageData.value.opis_slike
      }),
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      userStore.clearUser();
      router.push('/prijava');
      return;
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.poruka || 'Greška pri ažuriranju slike.');
    }

    successMsg.value = data.poruka || 'Slika uspješno ažurirana!';
    // Možeš preusmjeriti nakon uspješnog ažuriranja, ili ostaviti na stranici s porukom
    router.push(`/slika/${route.params.SIFRA_SLIKE}`);
  } catch (err) {
    console.error('Greška pri ažuriranju slike:', err);
    errorMsg.value = err.message || 'Došlo je do greške prilikom ažuriranja slike.';
  }
};

onMounted(fetchImage);
</script>

<style scoped>
.uredi-sliku-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

.image-form {
  width: 100%;
  max-width: 600px;
  padding: 2rem;
  background: white;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  border-radius: 15px;
}

.form-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--q-primary);
}

.q-input:not(:last-child) {
    margin-bottom: 20px;
}

.buttons {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.q-btn {
    padding: 10px 25px;
    font-weight: bold;
}

@media (max-width: 600px) {
    .image-form {
        padding: 1.5rem;
    }
    .form-title {
        font-size: 1.8rem;
        margin-bottom: 1rem;
    }
    .q-input {
        margin-bottom: 15px;
    }
    .buttons {
        margin-top: 1.5rem;
    }
}
</style>
