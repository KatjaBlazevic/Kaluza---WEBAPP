<template>
  <q-page class="q-pa-xl">
    <div class="q-mx-auto" style="max-width: 500px">
      <h2 class="text-h4 text-center q-mb-md">Registracija</h2>
      <q-form @submit.prevent="submitRegistration" class="q-gutter-md">
        <q-input v-model="ime" label="Ime" outlined required />
        <q-input v-model="prezime" label="Prezime" outlined required />
        <q-input v-model="email" label="Email" type="email" outlined required />
        <q-input v-model="lozinka" label="Lozinka" type="password" outlined required />
        <q-btn type="submit" label="Registriraj se" color="primary" :loading="loading" />
      </q-form>

      <q-btn flat label="Registriraj se putem Googlea" class="q-mt-md" icon="google" color="red" />

      <div class="text-center q-mt-md">
        Već imaš račun?
        <router-link to="/prijava" class="text-primary">Prijavi se</router-link>
      </div>

      <div v-if="successMsg" class="text-positive q-mt-md">{{ successMsg }}</div>
      <div v-if="errorMsg" class="text-negative q-mt-md">{{ errorMsg }}</div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';

const ime = ref('');
const prezime = ref('');
const email = ref('');
const lozinka = ref('');

const loading = ref(false);
const successMsg = ref('');
const errorMsg = ref('');

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
      throw new Error(data.message || 'Došlo je do greške.');
    }

    successMsg.value = data.message;
    ime.value = '';
    prezime.value = '';
    email.value = '';
    lozinka.value = '';
  } catch (err) {
    errorMsg.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>
