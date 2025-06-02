<template>
  <q-page class="q-pa-lg">
    <q-card class="q-pa-md q-mx-auto" style="max-width: 700px; width: 100%;">
      <h1 class="text-h4 text-center q-mb-lg uredi-title">Uredi svoj profil</h1>

      <q-form @submit.prevent="updateProfile" class="q-gutter-md">
        <q-input filled v-model="ime" label="Ime" />
        <q-input filled v-model="prezime" label="Prezime" />
        <q-input filled v-model="email" label="Email" type="email" />
        <q-input filled v-model="lozinka" label="Nova lozinka" type="password" />
        <div class="text-center">
          <q-btn label="Spremi promjene" color="primary" type="submit" unelevated />
        </div>
      </q-form>

      <div v-if="poruka" class="text-positive text-center q-mt-md">
        {{ poruka }}
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const ime = ref('')
const prezime = ref('')
const email = ref('')
const lozinka = ref('')
const poruka = ref('')

async function fetchProfile() {
  try {
    const res = await fetch('http://localhost:3000/full-profile', { credentials: 'include' });

    if (!res.ok) {
      router.push('/prijava');
      return;
    }
    const data = await res.json();
    console.log('🔍 Ažurirani profil:', data); // ✅ Provjera u konzoli
    userStore.setUser(data);
  } catch (err) {
    console.error('Greška prilikom dohvaćanja profila:', err);
    router.push('/prijava');
  }
}


onMounted(fetchProfile);

async function updateProfile() {
  try {
    const body = { ime: ime.value, prezime: prezime.value, email: email.value };

    const res = await fetch('http://localhost:3000/update-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error('Greška prilikom ažuriranja profila');
    const data = await res.json();

    if (data.user) {
      userStore.setUser({ ime: data.user.ime, prezime: data.user.prezime });

      // ✅ Forsiramo novo dohvaćanje profila
      await fetchProfile();

      // ✅ Nakon ažuriranja, preusmjeravamo korisnika na `/profile`
      router.push('/profile');
    }

    poruka.value = 'Profil je uspješno ažuriran!';
  } catch (err) {
    console.error(err);
    poruka.value = 'Došlo je do pogreške. Pokušajte ponovno.';
  }
}

</script>

<style scoped>
.q-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* Centrirano na ekranu */
  min-height: 100vh; /* Osigurava da stranica zauzima cijeli ekran */
}

.uredi-title{
  color: var(--q-primary);
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
}
</style>
