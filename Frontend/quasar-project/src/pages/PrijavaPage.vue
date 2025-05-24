<template>
  <q-page class="q-pa-xl">
    <div class="q-mx-auto" style="max-width: 400px">
      <h2 class="text-h4 text-center q-mb-md prijava-title">Prijava</h2>

      <q-form @submit.prevent="submitLogin" class="q-gutter-md">
        <q-input
          v-model="username"
          label="Email ili Nadimak"
          outlined
          required
          autofocus
        />
        <q-input
          v-model="lozinka"
          label="Lozinka"
          type="password"
          outlined
          required
        />

        <div class="row justify-center q-mt-md">
          <q-btn type="submit" label="Prijavi se" color="primary" :loading="loading" />
        </div>
      </q-form>

      <div class="text-center q-mt-md">
        Nemaš račun?
        <router-link to="/register" class="text-primary">Registriraj se</router-link>
      </div>

      <div v-if="errorMsg" class="text-negative q-mt-md text-center">{{ errorMsg }}</div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const lozinka = ref('')
const loading = ref(false)
const errorMsg = ref('')

const router = useRouter()

const submitLogin = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const res = await fetch('http://localhost:3000/prijava', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  // OVO JE KLJUČNO za slanje sesijskog cookieja
      body: JSON.stringify({
        username: username.value,
        lozinka: lozinka.value
      })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Neispravni podaci za prijavu.')
    }

    // Nema tokena, samo redirect jer je sesija postavljena na backendu
    router.push('/profile')
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.prijava-title {
  color: var(--q-primary);
  font-weight: bold;
  margin-bottom: 2.5rem;
}
</style>
