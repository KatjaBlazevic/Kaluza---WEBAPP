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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user';
const userStore = useUserStore(); // Pretpostavljam da imaš user store

const ime = ref('')
const prezime = ref('')
const email = ref('')
const lozinka = ref('')

const loading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const router = useRouter()

const submitRegistration = async () => {
  loading.value = true;
  successMsg.value = '';
  errorMsg.value = '';

  try {
    const res = await fetch('http://localhost:3000/registracija', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // ⚠️ UKLONJENO: credentials: 'include' - više ne koristimo sesije
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

    // ✅ POHRANA JWT TOKENA: Backend sada šalje token u 'data.token'
    localStorage.setItem('token', data.token);

    // ✅ DEKODIRANJE TOKENA: Da bi dobio user podatke (id, ime, prezime, rolu)
    // Tvoj 'userStore' očekuje objekt s 'id', 'ime', 'prezime', 'role'
    const decodedToken = JSON.parse(atob(data.token.split('.')[1]));

    // Pohrani korisnika u store
    userStore.setUser({
      id: decodedToken.id,
      ime: decodedToken.ime,
      prezime: decodedToken.prezime,
      role: decodedToken.role
      // Dodaj i druge podatke iz tokena ako ih koristiš u store-u, npr. email: decodedToken.email
    });

    // Automatski preusmjeri korisnika na izradu profila
    // ✅ PROSLJEĐIVANJE EMAILA: Email i dalje proslijeđuješ kao query parametar za 2. korak
    router.push({ path: '/izrada-profila', query: { email: email.value } });

  } catch (err) {
    errorMsg.value = err.message;
    // Opcionalno, obriši token ako postoji, jer registracija nije uspjela
    localStorage.removeItem('token');
    userStore.clearUser(); // Očisti store
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
