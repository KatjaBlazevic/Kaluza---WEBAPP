<template>
  <q-page class="q-pa-lg">
    <q-card class="q-pa-md q-mx-auto" style="max-width: 500px">
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
const userStore = useUserStore();

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
      credentials: 'include', // Omogućava primanje sesije
      body: JSON.stringify({
        ime: ime.value,
        prezime: prezime.value,
        email: email.value,
        lozinka: lozinka.value
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Došlo je do greške.');
    }

    successMsg.value = data.message;

    // Pohrani korisnika u store ako koristiš Pinia/Vuex (opcionalno)
    userStore.setUser(data.user);

    // Automatski preusmjeri korisnika na izradu profila
    router.push({ path: '/izrada-profila', query: { email: email.value } });
  } catch (err) {
    errorMsg.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.registracija-title {
  color: var(--q-primary);
  font-weight: bold;
  text-align: center;
}
</style>
