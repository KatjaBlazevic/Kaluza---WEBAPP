<template>
  <q-page class="q-pa-lg">
    <q-card class="q-pa-md q-mx-auto" style="max-width: 500px; width: 100%;">

      <q-card-section>
        <div class="text-h4 prijava-title">Prijava</div>
      </q-card-section>

      <q-form @submit.prevent="submitLogin">
        <q-card-section class="q-gutter-md">
          <q-input
            v-model="username"
            label="Email ili Nadimak"
            filled
            required
            autofocus
          />
          <q-input
            v-model="lozinka"
            label="Lozinka"
            type="password"
            filled
            required
          />
        </q-card-section>

        <q-card-actions align="center">
          <q-btn type="submit" label="Prijavi se" color="primary" :loading="loading" />
        </q-card-actions>
      </q-form>

      <q-card-section class="text-center">
        Nemaš račun?
        <router-link to="/registracija" class="text-primary">Registriraj se</router-link>
      </q-card-section>

      <q-card-section v-if="errorMsg" class="text-center">
        <div class="text-negative text-subtitle2 q-mt-md">{{ errorMsg }}</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'; // ✅ Uvezi userStore

const username = ref('')
const lozinka = ref('')
const loading = ref(false)
const errorMsg = ref('')

const router = useRouter()
const userStore = useUserStore(); // ✅ Inicijaliziraj userStore

const submitLogin = async () => {
  loading.value = true;
  errorMsg.value = '';

  try {
    const res = await fetch('http://localhost:3000/prijava', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        lozinka: lozinka.value
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Neispravni podaci za prijavu.');
    }

    // 📌 Backend bi trebao vratiti i podatke o korisniku uz token (id, role, ime, prezime)
    // Vaš backend vraća: { message, token, user: { id, role, ime, prezime } }
    // Tako da data.user sadrži potrebne informacije

    // Ažuriraj Pinia store s podacima korisnika i tokenom
    userStore.setUser({
        id: data.user.id,
        ime: data.user.ime,
        prezime: data.user.prezime,
        role: data.user.role,
        token: data.token // Proslijedi i token storeu
    });

    // Nakon što je store ažuriran, preusmjeri na odgovarajuću stranicu
    if (userStore.role === 'admin') { // Koristi userStore.role za provjeru uloge
        router.push('/admin');
    } else if (userStore.role === 'veterinar') {
        router.push('/profile-veterinar'); // ✅ Provjerite putanju za veterinara! (U vašem kodu ste imali /profile-veterinar, u mojim prijedlozima /veterinar-profile. Koristite ono što ste definirali u routeru.)
    } else if (userStore.role === 'korisnik') {
        router.push('/profile');
    }

  } catch (err) {
    errorMsg.value = err.message;
    // Očisti korisničke podatke u store-u u slučaju greške pri prijavi
    userStore.clearUser();
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

.prijava-title {
  color: var(--q-primary);
  font-weight: bold;
  text-align: center;
}
</style>
