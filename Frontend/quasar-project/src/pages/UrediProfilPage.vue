<template>
  <q-page class="q-pa-lg">
    <q-card class="q-pa-xl shadow-2 max-width q-mx-auto">
      <h1 class="text-h4 text-center q-mb-lg">Uredi svoj profil</h1>

      <q-form @submit.prevent="updateProfile" class="q-gutter-md">
        <q-input filled v-model="ime" label="Ime" />
        <q-input filled v-model="prezime" label="Prezime" />
        <q-input filled v-model="email" label="Email" type="email" />
        <q-input filled v-model="lozinka" label="Nova lozinka" type="password" />
        <q-input filled v-model="brojTelefona" label="Broj telefona" type="tel" />
        <q-input filled v-model="datumRodenja" label="Datum rođenja" type="date" />
        <q-input filled v-model="mjestoStanovanja" label="Mjesto stanovanja" />
        <q-input filled v-model="adresa" label="Adresa" />
        <q-input filled v-model="nadimak" label="Nadimak" />

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
const userStore = useUserStore()

const router = useRouter()

const ime = ref('')
const prezime = ref('')
const email = ref('')
const lozinka = ref('')
const brojTelefona = ref('')
const datumRodenja = ref('')
const mjestoStanovanja = ref('')
const adresa = ref('')
const nadimak = ref('')
const poruka = ref('')

// Dohvati podatke s backend-a
async function dohvatiProfil() {
  try {
    const res = await fetch('http://localhost:3000/profile', {
      credentials: 'include'
    })
    if (!res.ok) {
      router.push('/prijava')
      return
    }
    const data = await res.json()
    ime.value = data.ime_korisnika || ''
    prezime.value = data.prezime_korisnika || ''
    email.value = data.email_korisnika || ''
    brojTelefona.value = data.broj_telefona_korisnika || ''
    datumRodenja.value = data.datum_rodenja ? data.datum_rodenja.substring(0, 10) : ''
    mjestoStanovanja.value = data.mjesto_stanovanja || ''
    adresa.value = data.adresa_korisnika || ''
    nadimak.value = data.nadimak_korisnika || ''
  } catch (err) {
    console.error('Greška prilikom dohvaćanja profila:', err)
    router.push('/prijava')
  }
}

onMounted(dohvatiProfil)

// Ažuriraj podatke profila
async function updateProfile() {
  try {
    const body = {}

    if (ime.value) body.ime = ime.value
    if (prezime.value) body.prezime = prezime.value
    if (email.value) body.email = email.value
    if (lozinka.value) body.lozinka = lozinka.value
    if (brojTelefona.value) body.brojTelefona = brojTelefona.value
    if (datumRodenja.value) body.datumRodenja = datumRodenja.value
    if (mjestoStanovanja.value) body.mjesto = mjestoStanovanja.value
    if (adresa.value) body.adresa = adresa.value
    if (nadimak.value) body.nadimak = nadimak.value

    if (Object.keys(body).length === 0) {
      poruka.value = 'Niste unijeli nijednu promjenu.'
      return
    }

const res = await fetch('http://localhost:3000/update-profile', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(body)
})

if (!res.ok) throw new Error('Greška prilikom ažuriranja profila')

const data = await res.json()

// update lokalnih podataka za prikaz
if (data.user) {
  userStore.setUser({
    ime: data.user.ime,
    prezime: data.user.prezime
  })
}

poruka.value = 'Profil je uspješno ažuriran!'
lozinka.value = ''
router.push('/profile')

    // Ponovno dohvaćanje ažuriranih podataka
    await dohvatiProfil()

    // Ukloni poruku nakon par sekundi (opcionalno)
    setTimeout(() => { poruka.value = '' }, 3000)
  } catch (err) {
    console.error(err)
    poruka.value = 'Došlo je do pogreške. Pokušajte ponovno.'
  }
}
</script>


<style scoped>
.max-width {
  max-width: 500px;
}
</style>
