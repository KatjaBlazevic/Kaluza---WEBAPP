<template>
  <q-page class="korisnici-page">
    <div class="q-pa-md">
      <h1>Upravljanje Korisnicima</h1>

      <q-input v-model="pretraga" label="Pretraži korisnike..." outlined dense class="q-mb-md" />

      <q-table
        :rows="filtriraniKorisnici"
        :columns="columns"
        row-key="SIFRA_KORISNIKA"
        dense
        bordered
        class="q-mt-md"
      >
        <template v-slot:body-cell-akcije="props">
          <q-td :props="props">
            <q-btn color="accent" label="Obriši" dense @click="obrisiKorisnika(props.row.SIFRA_KORISNIKA)" />
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router"; // Uvezi useRouter
import { useUserStore } from "@/stores/user"; // Uvezi Pinia store

const router = useRouter(); // Inicijaliziraj router
const userStore = useUserStore(); // Inicijaliziraj user store

const korisnici = ref([]);
const pretraga = ref("");
const prikaziSamoAktivne = ref(false); // Ova varijabla nije korištena u templateu za filtriranje, ali je ostavljena

const columns = [
  { name: "ime", label: "Ime", align: "left", field: "ime_korisnika" },
  { name: "prezime", label: "Prezime", align: "left", field: "prezime_korisnika" },
  { name: "email", label: "Email", align: "left", field: "email_korisnika" },
  { name: "nadimak", label: "Nadimak", align: "left", field: "nadimak_korisnika" },
  { name: "status", label: "Status", align: "center", field: "status_korisnika" },
  { name: "akcije", label: "Akcije", align: "center" }
];

// Filtriranje korisnika na temelju pretrage (prikaziSamoAktivne nije u templateu)
const filtriraniKorisnici = computed(() => {
  return korisnici.value.filter(k =>
    (prikaziSamoAktivne.value ? k.status_korisnika === "aktivan" : true) && // Ovo će uvijek biti true jer prikaziSamoAktivne je uvijek false
    Object.values(k).some(vrijednost =>
      vrijednost !== null && vrijednost.toString().toLowerCase().includes(pretraga.value.toLowerCase())
    )
  );
});

// Prikaz broja aktivnih korisnika (nije korišteno u templateu)
const brojAktivnihKorisnika = computed(() => {
  return korisnici.value.filter(k => k.status_korisnika === "aktivan").length;
});

async function fetchKorisnici() {
  // 1. Provjera je li korisnik autentificiran i ima li ulogu 'admin'
  if (!userStore.isAuthenticated || userStore.getUserRole !== 'admin') {
    console.warn("Pokušaj pristupa stranici za upravljanje korisnicima bez administratorskih ovlasti.");
    router.push('/prijava'); // Preusmjeri na stranicu za prijavu
    return; // Prekini izvršavanje funkcije
  }

  const token = userStore.token; // Dohvati token iz Pinia store-a

  try {
    const res = await fetch("http://localhost:3000/admin/korisnici", {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Šaljemo JWT token
      }
    });

    // 2. Rukovanje statusima odgovora s backenda
    if (res.status === 403 || res.status === 401) {
      console.error('Frontend: Pristup odbijen. Sesija istekla ili nema dozvolu za korisnike.');
      userStore.clearUser(); // Izbriši podatke o korisniku
      router.push('/prijava'); // Preusmjeri na prijavu
      return;
    }

    if (!res.ok) {
      const errorData = await res.json(); // Pokušaj dohvatiti detalje greške s backenda
      throw new Error(errorData.poruka || "Greška pri dohvaćanju korisnika.");
    }

    korisnici.value = await res.json();
    console.log("Dohvaćeni korisnici:", korisnici.value); // Debugging
  } catch (err) {
    console.error("❌ Greška pri dohvaćanju korisnika:", err.message);
  }
}

async function obrisiKorisnika(id) {
  // Provjera autorizacije prije slanja zahtjeva za brisanje
  if (!userStore.isAuthenticated || userStore.getUserRole !== 'admin') {
    console.warn("Pokušaj brisanja korisnika bez administratorskih ovlasti.");
    router.push('/prijava'); // Preusmjeri na stranicu za prijavu
    return;
  }

  if (confirm("Jeste li sigurni da želite obrisati ovog korisnika?")) {
    const token = userStore.token; // Dohvati token

    try {
      const res = await fetch(`http://localhost:3000/admin/korisnici/${id}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Šaljemo JWT token
        }
      });

      if (res.status === 403 || res.status === 401) {
        console.error('Frontend: Pristup odbijen. Sesija istekla ili nema dozvolu za brisanje.');
        userStore.clearUser();
        router.push('/prijava');
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.poruka || "Greška pri brisanju korisnika.");
      }

      korisnici.value = korisnici.value.filter(k => k.SIFRA_KORISNIKA !== id);
      console.log(`Korisnik ${id} uspješno obrisan.`); // Debugging
    } catch (err) {
      console.error("❌ Greška pri brisanju korisnika:", err.message);
    }
  }
}

onMounted(fetchKorisnici);
</script>

<style scoped>
.korisnici-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: top; /* Centriramo sadržaj */
  height: 100vh; /* Oduzima cijelu visinu ekrana */
}

.q-table {
  max-width: 80%; /* Povećava širinu tablice */
  font-size: 16px; /* Veći font za bolju čitljivost */
}

.q-table th,
.q-table td {
  padding: 16px; /* Povećava razmak između redova */
  text-align: center; /* Poravnava tekst */
}

h1 {
  font-size: 24px;
  font-weight: bold;
  color: var(--q-primary);
  text-align: center;
  margin-bottom: 24px;
}

p {
  font-size: 18px;
  font-weight: bold;
  color: var(--q-primary);
  text-align: center;
}

h1 {
  font-size: 24px;
  font-weight: bold;
  color: var(--q-primary);
  text-align: center;
  margin-bottom: 24px;
}

.q-input,
.q-checkbox {
  max-width: 400px;
  margin: 0 auto;
  display: block;
}

p {
  font-size: 18px;
  font-weight: bold;
  color: var(--q-primary);
  text-align: center;
}
</style>
