<template>
  <q-page class="q-pa-lg">
    <q-card class="q-pa-md q-mx-auto" style="max-width: 500px">
      <q-card-section>
        <div class="text-h4 izradaprofila-title">Dovrši izradu profila</div>
      </q-card-section>

      <q-form @submit.prevent="submitProfile">
        <q-card-section class="q-gutter-md">
          <q-input v-model="nadimak" label="Nadimak" filled required />
          <q-input v-model="adresa" label="Adresa" filled />
          <q-input v-model="mjesto" label="Mjesto stanovanja" filled />
          <q-input v-model="datumRodenja" label="Datum rođenja" type="date" filled />
          <q-input v-model="brojTelefona" label="Broj telefona" type="tel" filled />
        </q-card-section>

        <q-card-actions align="center">
          <q-btn type="submit" label="Spremi profil" color="primary" :loading="loading" />
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
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Email dohvaćen iz query parametra
const email = route.query.email

const nadimak = ref('')
const adresa = ref('')
const mjesto = ref('')
const datumRodenja = ref('')
const brojTelefona = ref('')

const loading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const submitProfile = async () => {
  loading.value = true
  successMsg.value = ''
  errorMsg.value = ''

  try {
    const response = await fetch('http://localhost:3000/izrada-profila', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        nadimak: nadimak.value,
        adresa: adresa.value,
        mjesto: mjesto.value,
        datumRodenja: datumRodenja.value,
        brojTelefona: brojTelefona.value
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Greška prilikom ažuriranja profila.')
    }

//Preusmjeri na treću fazu registracije
    successMsg.value = 'Profil uspješno ažuriran!'
    setTimeout(() => router.push('/dodaj-ljubimca'), 1000)
  } catch (err) {
    errorMsg.value = err.message || 'Greška prilikom slanja podataka.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.izradaprofila-title{
  color: var(--q-primary);
  font-weight: bold;
  text-align: center;
}
</style>
