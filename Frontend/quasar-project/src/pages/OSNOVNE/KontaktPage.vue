<template>
  <q-page class="kontakt-page">
    <!-- Hero sekcija -->
    <div class="hero-section flex flex-center">
      <div class="hero-content text-center">
        <h1 class="hero-title">Kontaktiraj nas</h1>
        <p class="hero-subtitle">Imate pitanje? Slobodno nam se javite!</p>
      </div>
    </div>

    <!-- Kontakt sadržaj u dvije kolone -->
    <div class="section-container q-px-xl q-pt-xl q-pb-xl">
      <div class="row q-col-gutter-xl justify-center items-start">
        <!-- Lijevo: Forma -->
        <div class="col-12 col-md-6">
          <q-form @submit.prevent="submitForm" class="q-gutter-md">
            <q-input v-model="ime" label="Vaše ime" outlined required />
            <q-input v-model="email" label="Vaš e-mail" type="email" outlined required />
            <q-input v-model="poruka" label="Poruka" type="textarea" outlined required />
            <q-btn type="submit" label="Pošalji poruku" color="primary" :loading="loading" />
          </q-form>
          <div v-if="successMsg" class="q-mt-md text-positive">{{ successMsg }}</div>
          <div v-if="errorMsg" class="q-mt-md text-negative">{{ errorMsg }}</div>
        </div>

        <!-- Desno: Kontakt podaci -->
        <div class="col-12 col-md-5">
          <div class="kontakt-info bg-grey-2 q-pa-lg rounded-borders text-center">
            <div class="kontakt-naslov text-h6 q-mb-md">Možete nas kontaktirati i putem:</div>
            <p class="q-mb-sm"><q-icon name="email" class="q-mr-sm" /> info@petscare.hr</p>
            <p class="q-mb-sm"><q-icon name="phone" class="q-mr-sm" /> +385 91 123 4567</p>
            <p class="q-mb-sm"><q-icon name="place" class="q-mr-sm" /> Ulica Ljubimaca 5, Rijeka</p>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';

const ime = ref('');
const email = ref('');
const poruka = ref('');

const loading = ref(false);
const successMsg = ref('');
const errorMsg = ref('');

const submitForm = async () => {
  loading.value = true;
  successMsg.value = '';
  errorMsg.value = '';

  try {
    const response = await fetch('http://localhost:3000/sendmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ime: ime.value,
        email: email.value,
        poruka: poruka.value
      })
    });

    if (!response.ok) throw new Error('Došlo je do greške prilikom slanja poruke.');

    successMsg.value = 'Poruka je uspješno poslata! Hvala na vašem upitu.';
    ime.value = '';
    email.value = '';
    poruka.value = '';
  } catch (error) {
    errorMsg.value = error.message || 'Greška u komunikaciji sa serverom.';
  } finally {
    loading.value = false;
  }
};

</script>

<style scoped>
.kontakt-page {
  padding: 0;
}

.hero-section {
  height: 70vh;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8)), url('/hero_kontakt.jpg');
  background-size: cover;
  background-position: center;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-bottom: 3rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 1.5rem;
  opacity: 0.9;
  max-width: 800px;
  margin: 0 auto;
}

.kontakt-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--q-dark);
  text-align: center;
}

.kontakt-naslov {
  font-weight: bold;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.2rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }
}
</style>
