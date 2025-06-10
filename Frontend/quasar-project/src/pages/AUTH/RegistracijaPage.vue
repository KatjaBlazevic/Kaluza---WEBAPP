<template>
  <q-page class="q-pa-lg">
    <q-card class="q-pa-md q-mx-auto" style="max-width: 500px; width: 100%;">
      <q-card-section>
        <div class="text-h4 registracija-title">Registracija</div>
      </q-card-section>

      <q-form @submit.prevent="submitRegistration">
        <q-card-section class="q-gutter-md">
          <q-input v-model="ime" label="Ime" filled required />
          <q-input v-model="prezime" label="Prezime" filled required />
          <q-input v-model="email" label="Email" type="email" filled required />
          <q-input v-model="lozinka" label="Lozinka" type="password" filled required />
        </q-card-section>

        <q-card-actions align="center">
          <q-btn type="submit" label="Registriraj se" color="primary" :loading="loading" />
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

      <q-card-section class="text-center">
        Već imaš račun?
        <router-link to="/prijava" class="text-primary">Prijavi se</router-link>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// import { useUserStore } from '@/stores/user'; // ❌ NE TREBA NAM USER STORE ZA 1. KORAK REGISTRACIJE

// const userStore = useUserStore(); // ❌ UKLONI OVO

const ime = ref('');
const prezime = ref('');
const email = ref('');
const lozinka = ref('');

const loading = ref(false);
const successMsg = ref('');
const errorMsg = ref('');

const router = useRouter();

const submitRegistration = async () => {
  loading.value = true;
  successMsg.value = '';
  errorMsg.value = '';

  try {
    const res = await fetch('http://localhost:3000/registracija', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ime: ime.value,
        prezime: prezime.value,
        email: email.value,
        lozinka: lozinka.value
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Došlo je do greške prilikom registracije.');
    }

    successMsg.value = data.message;

    // ❌ UKLONI OVE LINIJE KOJE RADE S TOKENOM I USER STORE-OM
    // localStorage.setItem('token', data.token);
    // const decodedToken = JSON.parse(atob(data.token.split('.')[1]));
    // userStore.setUser({
    //   id: decodedToken.id,
    //   ime: decodedToken.ime,
    //   prezime: decodedToken.prezime,
    //   role: decodedToken.role
    // });

    // ✅ KLJUČNA PROMJENA: Preusmjeri na izradu profila i proslijedi userId
    // Backend sada vraća userId, ne token za prijavu
    if (data.userId) {
      router.push({ path: '/izrada-profila', query: { userId: data.userId } });
    } else {
      // Ako iz nekog razloga backend ne vrati userId, javi grešku
      errorMsg.value = 'Registracija uspješna, ali ID korisnika nije primljen. Molimo pokušajte ponovno prijavu.';
    }

  } catch (err) {
    errorMsg.value = err.message;
    // Očisti poruku o uspjehu ako je greška
    successMsg.value = '';
    // userStore.clearUser(); // ❌ UKLONI OVO ako userStore nije ni korišten
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
  justify-content: center; /* Centrirano na ekranu */
  min-height: 100vh; /* Osigurava da stranica zauzima cijeli ekran */
}

.registracija-title {
  color: var(--q-primary);
  font-weight: bold;
  text-align: center;
}
</style>
