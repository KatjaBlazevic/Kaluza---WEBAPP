<template>
  <q-page class="korisnici-page">
    <div class="q-pa-md">
      <h1>Upravljanje Korisnicima</h1>

      <!-- Brza pretraga korisnika -->
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

const korisnici = ref([]);
const pretraga = ref("");
const prikaziSamoAktivne = ref(false);

const columns = [
  { name: "ime", label: "Ime", align: "left", field: "ime_korisnika" },
  { name: "prezime", label: "Prezime", align: "left", field: "prezime_korisnika" },
  { name: "email", label: "Email", align: "left", field: "email_korisnika" },
  { name: "nadimak", label: "Nadimak", align: "left", field: "nadimak_korisnika" },
  { name: "status", label: "Status", align: "center", field: "status_korisnika" },
  { name: "akcije", label: "Akcije", align: "center" }
];

// Filtriranje korisnika na temelju pretrage i statusa
const filtriraniKorisnici = computed(() => {
  return korisnici.value.filter(k =>
    (prikaziSamoAktivne.value ? k.status_korisnika === "aktivan" : true) &&
    Object.values(k).some(vrijednost =>
      vrijednost.toString().toLowerCase().includes(pretraga.value.toLowerCase())
    )
  );
});

// Prikaz broja aktivnih korisnika
const brojAktivnihKorisnika = computed(() => {
  return korisnici.value.filter(k => k.status_korisnika === "aktivan").length;
});

async function fetchKorisnici() {
  try {
    const res = await fetch("http://localhost:3000/admin/korisnici", { method: "GET", credentials: "include" });
    if (!res.ok) throw new Error("Greška pri dohvaćanju korisnika.");
    korisnici.value = await res.json();
  } catch (err) {
    console.error("❌ Greška pri dohvaćanju korisnika:", err);
  }
}

async function obrisiKorisnika(id) {
  if (confirm("Jeste li sigurni da želite obrisati ovog korisnika?")) {
    try {
      const res = await fetch(`http://localhost:3000/admin/korisnici/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Greška pri brisanju korisnika.");
      korisnici.value = korisnici.value.filter(k => k.SIFRA_KORISNIKA !== id);
    } catch (err) {
      console.error("❌ Greška pri brisanju korisnika:", err);
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
