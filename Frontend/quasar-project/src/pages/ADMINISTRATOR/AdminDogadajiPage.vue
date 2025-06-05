<template>
  <q-page class="dogadaji-page">
    <div class="q-pa-md">
      <h1>Upravljanje Događajima</h1>

      <div class="gumb-container">
        <q-btn color="primary" label="Dodaj događaj" @click="otvoriDodavanje" class="q-mb-md" />
      </div>
      <q-input v-model="pretraga" label="Pretraži događaje..." outlined dense class="q-mb-md" />
      <q-checkbox v-model="prikaziSamoAktivne" label="Prikaži samo aktivne događaje" class="q-mb-md" />
      <q-checkbox v-model="prikaziProsleDogadaje" label="Prikaži prošle događaje" class="q-mb-md" />
      <q-table
        :rows="filtriraniDogadaji"
        :columns="columns"
        row-key="SIFRA_DOGADAJA"
        dense
        bordered
        class="q-mt-md"
        :pagination="pagination"
      >
        <template v-slot:body-cell-akcije="props">
          <q-td :props="props">
            <q-btn color="secondary" label="Uredi" dense @click="otvoriUredivanje(props.row)" class="q-mr-sm" />
            <q-btn color="accent" label="Obriši" dense @click="obrisiDogadaj(props.row.SIFRA_DOGADAJA)" />
          </q-td>
        </template>
      </q-table>
    </div>

    <q-dialog v-model="dialogOtvoren">
      <q-card class="q-pa-md">
        <q-card-section>
          <h2>{{ trenutniDogadaj ? 'Uredi' : 'Dodaj' }} Događaj</h2>
        </q-card-section>

        <q-card-section>
          <q-input v-model="dogadaj.naziv_dogadaja" label="Naziv događaja" />
          <q-input v-model="dogadaj.vrsta_dogadaja" label="Vrsta događaja" />
          <q-input v-model="dogadaj.opis_dogadaja" label="Opis događaja" type="textarea" />
          <q-input v-model="dogadaj.grad" label="Grad" />
          <q-input v-model="dogadaj.adresa" label="Adresa" />
          <q-input v-model="dogadaj.datum_dogadaja" label="Datum" type="date" />
          <q-input v-model="dogadaj.vrijeme_dogadaja" label="Vrijeme" type="time" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn color="primary" label="Spremi" @click="spremiDogadaj" />
          <q-btn label="Odustani" flat @click="dialogOtvoren = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router"; // Uvezi useRouter
import { useUserStore } from "@/stores/user"; // Uvezi Pinia store

const router = useRouter();
const userStore = useUserStore();

const pretraga = ref("");
const dogadaji = ref([]);
const dialogOtvoren = ref(false);
const trenutniDogadaj = ref(null);
const prikaziSamoAktivne = ref(false);
const prikaziProsleDogadaje = ref(false);
const pagination = ref({
  rowsPerPage: 4,
});
const dogadaj = ref({
  naziv_dogadaja: "",
  vrsta_dogadaja: "",
  opis_dogadaja: "",
  grad: "",
  adresa: "",
  datum_dogadaja: "",
  vrijeme_dogadaja: ""
});

const columns = [
  { name: "naziv", label: "Naziv događaja", align: "left", field: "naziv_dogadaja" },
  { name: "vrsta", label: "Vrsta", align: "left", field: "vrsta_dogadaja" },
  { name: "grad", label: "Grad", align: "left", field: "grad" },
  { name: "datum", label: "Datum", align: "center", field: row => formatirajDatum(row.datum_dogadaja) },
  { name: "vrijeme", label: "Vrijeme", align: "center", field: row => formatirajVrijeme(row.vrijeme_dogadaja) },
  { name: "akcije", label: "Akcije", align: "center" }
];

const filtriraniDogadaji = computed(() => {
  const danas = new Date();
  danas.setHours(0, 0, 0, 0); // Resetiraj vrijeme na početak dana za usporedbu

  return dogadaji.value.filter(d => {
    const datumDogadaja = new Date(d.datum_dogadaja);
    datumDogadaja.setHours(0, 0, 0, 0); // Resetiraj vrijeme događaja na početak dana za usporedbu

    // Filtriranje po aktivnim/prošlim događajima
    if (prikaziSamoAktivne.value && prikaziProsleDogadaje.value) {
      // Ako su oba checkboxa označena, ne filtriraj po datumu, samo po pretrazi
    } else if (prikaziSamoAktivne.value) {
      if (datumDogadaja < danas) return false; // Prikaži samo buduće/današnje
    } else if (prikaziProsleDogadaje.value) {
      if (datumDogadaja >= danas) return false; // Prikaži samo prošle
    } else {
      // Ako nijedan checkbox nije označen, prikaži sve
    }

    // Filtriranje po pretrazi
    return Object.values(d).some(vrijednost =>
      vrijednost !== null && vrijednost.toString().toLowerCase().includes(pretraga.value.toLowerCase())
    );
  });
});

// Ova funkcija nije korištena u templateu, ali je ostavljena
const brojAktivnihDogadaja = computed(() => {
  return dogadaji.value.filter(d => new Date(d.datum_dogadaja) >= new Date()).length;
});

function formatirajDatum(datum) {
  if (!datum) return '';
  const d = new Date(datum);
  // Provjeri je li datum validan
  if (isNaN(d.getTime())) return '';
  return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}.${d.getFullYear()}`;
}

function formatirajVrijeme(vrijeme) {
  if (!vrijeme) return '';
  return vrijeme.substring(0, 5); // Uzima samo HH:mm format
}

async function fetchDogadaji() {
  // 1. Provjera je li korisnik autentificiran i ima li ulogu 'admin'
  if (!userStore.isAuthenticated || userStore.getUserRole !== 'admin') {
    console.warn("Pokušaj pristupa stranici za upravljanje događajima bez administratorskih ovlasti.");
    router.push('/prijava'); // Preusmjeri na stranicu za prijavu
    return; // Prekini izvršavanje funkcije
  }

  const token = userStore.token; // Dohvati token iz Pinia store-a

  try {
    const res = await fetch("http://localhost:3000/admin/dogadaji", {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Šaljemo JWT token
      }
    });

    // 2. Rukovanje statusima odgovora s backenda
    if (res.status === 403 || res.status === 401) {
      console.error('Frontend: Pristup odbijen. Sesija istekla ili nema dozvolu za događaje.');
      userStore.clearUser(); // Izbriši podatke o korisniku
      router.push('/prijava'); // Preusmjeri na prijavu
      return;
    }

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.poruka || "Greška pri dohvaćanju događaja.");
    }

    dogadaji.value = await res.json();
    console.log("Dohvaćeni događaji:", dogadaji.value); // Debugging
  } catch (err) {
    console.error("❌ Greška pri dohvaćanju događaja:", err.message);
  }
}

function otvoriDodavanje() {
  dogadaj.value = {
    naziv_dogadaja: "",
    vrsta_dogadaja: "",
    opis_dogadaja: "",
    grad: "",
    adresa: "",
    datum_dogadaja: "",
    vrijeme_dogadaja: ""
  }; // Resetiraj formu
  trenutniDogadaj.value = null;
  dialogOtvoren.value = true;
}

function otvoriUredivanje(dogadajZaUrediti) {
  trenutniDogadaj.value = dogadajZaUrediti;
  // Kreiraj duboku kopiju objekta da ne bi direktno mijenjao original
  dogadaj.value = { ...dogadajZaUrediti };

  // Konverzija datuma i vremena za prikaz u input poljima tipa date/time
  // Datum: mora biti u YYYY-MM-DD formatu za input type="date"
  if (dogadajZaUrediti.datum_dogadaja) {
      const d = new Date(dogadajZaUrediti.datum_dogadaja);
      dogadaj.value.datum_dogadaja = d.toISOString().split("T")[0];
  } else {
      dogadaj.value.datum_dogadaja = '';
  }

  // Vrijeme: mora biti u HH:mm formatu za input type="time"
  if (dogadajZaUrediti.vrijeme_dogadaja) {
      dogadaj.value.vrijeme_dogadaja = dogadajZaUrediti.vrijeme_dogadaja.substring(0, 5); // HH:mm format
  } else {
      dogadaj.value.vrijeme_dogadaja = '';
  }

  dialogOtvoren.value = true;
}

async function spremiDogadaj() {
  // Provjera autorizacije prije slanja zahtjeva za spremanje
  if (!userStore.isAuthenticated || userStore.getUserRole !== 'admin') {
    console.warn("Pokušaj spremanja događaja bez administratorskih ovlasti.");
    router.push('/prijava');
    return;
  }

  const token = userStore.token;
  const metoda = trenutniDogadaj.value ? "PUT" : "POST";
  const url = trenutniDogadaj.value
    ? `http://localhost:3000/admin/dogadaji/${trenutniDogadaj.value.SIFRA_DOGADAJA}`
    : "http://localhost:3000/admin/dogadaji";

  try {
    const res = await fetch(url, {
      method: metoda,
      body: JSON.stringify(dogadaj.value),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Šaljemo JWT token
      }
    });

    if (res.status === 403 || res.status === 401) {
      console.error('Frontend: Pristup odbijen. Sesija istekla ili nema dozvolu za spremanje događaja.');
      userStore.clearUser();
      router.push('/prijava');
      return;
    }

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.poruka || "Greška pri spremanju događaja.");
    }

    dialogOtvoren.value = false;
    await fetchDogadaji(); // Osvježi listu nakon spremanja
    console.log("Događaj uspješno spremljen.");
  } catch (err) {
    console.error("❌ Greška pri spremanju događaja:", err.message);
  }
}

async function obrisiDogadaj(id) {
  // Provjera autorizacije prije slanja zahtjeva za brisanje
  if (!userStore.isAuthenticated || userStore.getUserRole !== 'admin') {
    console.warn("Pokušaj brisanja događaja bez administratorskih ovlasti.");
    router.push('/prijava');
    return;
  }

  if (confirm("Jeste li sigurni da želite obrisati ovaj događaj?")) {
    const token = userStore.token;

    try {
      const res = await fetch(`http://localhost:3000/admin/dogadaji/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Šaljemo JWT token
        }
      });

      if (res.status === 403 || res.status === 401) {
        console.error('Frontend: Pristup odbijen. Sesija istekla ili nema dozvolu za brisanje događaja.');
        userStore.clearUser();
        router.push('/prijava');
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.poruka || "Greška pri brisanju događaja.");
      }

      dogadaji.value = dogadaji.value.filter(d => d.SIFRA_DOGADAJA !== id);
      console.log(`Događaj ${id} uspješno obrisan.`);
    } catch (err) {
      console.error("❌ Greška pri brisanju događaja:", err.message);
    }
  }
}

onMounted(fetchDogadaji);
</script>

<style scoped>
.dogadaji-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
}

.gumb-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

h1 {
  font-size: 26px;
  font-weight: bold;
  color: var(--q-primary);
  text-align: center;
  margin-bottom: 24px;
}

.table-wide {
  max-width: 90%;
}

.q-table th {
  font-weight: bold;
  background-color: var(--q-primary);
  color: white;
}

.q-table td {
  padding: 14px;
  font-size: 16px;
}

.q-btn {
  padding: 6px 14px;
}

.q-card {
  max-width: 500px;
  margin: auto;
}

.q-input {
  margin-bottom: 16px;
}
</style>
