<template>
  <q-page class="q-pa-lg">
    <q-card class="q-pa-md q-mx-auto" style="max-width: 700px; width: 100%;">
      <h1 class="text-h4 text-center q-mb-lg uredi-title">Uredi svoj profil</h1>

      <q-form @submit.prevent="updateProfile" class="q-gutter-md">
        <q-input filled v-model="ime" label="Ime" />
        <q-input filled v-model="prezime" label="Prezime" />
        <q-input filled v-model="email" label="Email" type="email" />
        <q-input filled v-model="lozinka" label="Nova lozinka" type="password" hint="Ostavite prazno za nepromijenjenu lozinku." />
        <div class="text-center">
          <q-btn label="Spremi promjene" color="primary" type="submit" unelevated />
        </div>
      </q-form>

      <div v-if="poruka" class="text-positive text-center q-mt-md">
        {{ poruka }}
      </div>
      <div v-if="errorMsg" class="text-negative text-center q-mt-md">
        {{ errorMsg }}
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
const errorMsg = ref('');

async function fetchProfile() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/prijava');
      return;
    }

    const res = await fetch('http://localhost:3000/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      localStorage.removeItem('token');
      userStore.clearUser();
      router.push('/prijava');
      return;
    }

    const data = await res.json();
    console.log('Dohvaćeni profil:', data);

    ime.value = data.ime;
    prezime.value = data.prezime;
    email.value = data.email;

    userStore.setUser(data);

  } catch (err) {
    console.error('Greška prilikom dohvaćanja profila:', err);
    localStorage.removeItem('token');
    userStore.clearUser();
    router.push('/prijava');
  }
}

async function updateProfile() {
  poruka.value = '';
  errorMsg.value = '';

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/prijava');
      return;
    }

    const body = {
      ime: ime.value,
      prezime: prezime.value,
      email: email.value
    };

    if (lozinka.value) {
      body.lozinka = lozinka.value;
    }

    const res = await fetch('http://localhost:3000/update-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Greška prilikom ažuriranja profila');
    }

    if (data.token) {
      userStore.setUser({
        id: data.user.id,
        ime: data.user.ime,
        prezime: data.user.prezime,
        email: data.user.email,
        role: userStore.role,
        token: data.token
      });
    } else {
      userStore.setUser({
        ...userStore.$state,
        ime: data.user.ime,
        prezime: data.user.prezime,
        email: data.user.email
      });
    }

    poruka.value = 'Profil je uspješno ažuriran!';
    // Dodana linija za preusmjeravanje
    router.push('/profile');

  } catch (err) {
    console.error(err);
    errorMsg.value = err.message || 'Došlo je do pogreške. Pokušajte ponovno.';
    if (err.message.includes('token') || err.message.includes('prijavljen')) {
        localStorage.removeItem('token');
        userStore.clearUser();
        router.push('/prijava');
    }
  }
}

onMounted(fetchProfile);
</script>

<style scoped>
.q-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.uredi-title{
  color: var(--q-primary);
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
}
</style>
