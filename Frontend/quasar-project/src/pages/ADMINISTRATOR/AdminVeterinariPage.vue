<template>
  <q-page class="veterinari-page">
    <div class="q-pa-md">
      <h1>Upravljanje Veterinarima</h1>

      <div class="gumb-container">
        <q-btn color="primary" label="Dodaj veterinara" @click="otvoriDodavanje" />
      </div>
      <q-input v-model="pretraga" label="Pretraži veterinare..." outlined dense class="q-mb-md" />
      <q-table
        :rows="filtriraniVeterinari"
        :columns="columns"
        row-key="SIFRA_VETERINARA"
        dense
        bordered
        class="q-mt-md"
      >
        <template v-slot:body-cell-akcije="props">
          <q-td :props="props">
            <q-btn color="secondary" label="Uredi" dense @click="otvoriUredivanje(props.row)" class="q-mr-sm" />
            <q-btn color="accent" label="Obriši" dense @click="obrisiVeterinara(props.row.SIFRA_VETERINARA)" />
          </q-td>
        </template>
      </q-table>
    </div>

    <q-dialog v-model="dialogOtvoren">
      <q-card class="q-pa-md">
        <q-card-section>
          <h2>{{ trenutniVeterinar ? 'Uredi' : 'Dodaj' }} Veterinara</h2>
        </q-card-section>

        <q-card-section>
          <q-input v-model="veterinar.ime_veterinara" label="Ime" />
          <q-input v-model="veterinar.prezime_veterinara" label="Prezime" />
          <q-input v-model="veterinar.kontakt_veterinara" label="Kontakt" />
          <q-input v-model="veterinar.lokacija_veterinara" label="Lokacija" />
          <q-input v-model="veterinar.email_veterinara" label="Email" type="email" />
          <q-input v-model="veterinar.lozinka_veterinara" label="Lozinka" type="password" v-if="!trenutniVeterinar"/>
          <q-input v-model="veterinar.specijalizacija_veterinara" label="Specijalizacija" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn color="primary" label="Spremi" @click="spremiVeterinara" />
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
const veterinari = ref([]);
const dialogOtvoren = ref(false);
const trenutniVeterinar = ref(null);

const veterinar = ref({
  ime_veterinara: "",
  prezime_veterinara: "",
  kontakt_veterinara: "",
  lokacija_veterinara: "",
  email_veterinara: "",
  lozinka_veterinara: "", // Lozinka se obično šalje samo pri dodavanju
  specijalizacija_veterinara: ""
});

const columns = [
  { name: "ime", label: "Ime", align: "left", field: "ime_veterinara" },
  { name: "prezime", label: "Prezime", align: "left", field: "prezime_veterinara" },
  { name: "kontakt", label: "Kontakt", align: "left", field: "kontakt_veterinara" },
  { name: "lokacija", label: "Lokacija", align: "left", field: "lokacija_veterinara" },
  { name: "email", label: "Email", align: "left", field: "email_veterinara" },
  { name: "specijalizacija", label: "Specijalizacija", align: "left", field: "specijalizacija_veterinara" },
  { name: "akcije", label: "Akcije", align: "center" }
];

const filtriraniVeterinari = computed(() => {
  return veterinari.value.filter(v =>
    Object.values(v).some(vrijednost =>
      vrijednost !== null && vrijednost.toString().toLowerCase().includes(pretraga.value.toLowerCase())
    )
  );
});

async function fetchVeterinari() {
  // 1. Provjera je li korisnik autentificiran i ima li ulogu 'admin'
  if (!userStore.isAuthenticated || userStore.getUserRole !== 'admin') {
    console.warn("Pokušaj pristupa stranici za upravljanje veterinarima bez administratorskih ovlasti.");
    router.push('/prijava');
    return;
  }

  const token = userStore.token;

  try {
    const res = await fetch("http://localhost:3000/admin/veterinari", {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Šaljemo JWT token
      }
    });

    // 2. Rukovanje statusima odgovora s backenda
    if (res.status === 403 || res.status === 401) {
      console.error('Frontend: Pristup odbijen. Sesija istekla ili nema dozvolu za veterinare.');
      userStore.clearUser();
      router.push('/prijava');
      return;
    }

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.poruka || "Greška pri dohvaćanju veterinarâ.");
    }

    veterinari.value = await res.json();
    console.log("Dohvaćeni veterinari:", veterinari.value);
  } catch (err) {
    console.error("❌ Greška pri dohvaćanju veterinarâ:", err.message);
  }
}

function otvoriDodavanje() {
  veterinar.value = {
    ime_veterinara: "",
    prezime_veterinara: "",
    kontakt_veterinara: "",
    lokacija_veterinara: "",
    email_veterinara: "",
    lozinka_veterinara: "", // Ovo se popunjava samo za dodavanje
    specijalizacija_veterinara: ""
  };
  trenutniVeterinar.value = null;
  dialogOtvoren.value = true;
}

function otvoriUredivanje(veterinarZaUrediti) {
  trenutniVeterinar.value = veterinarZaUrediti;
  // Kreiraj duboku kopiju objekta. Ne dohvaćaj lozinku.
  const { lozinka_veterinara, ...rest } = veterinarZaUrediti;
  veterinar.value = { ...rest, lozinka_veterinara: "" }; // Postavi lozinku na prazan string pri uređivanju
  dialogOtvoren.value = true;
}

async function spremiVeterinara() {
  // Provjera autorizacije prije slanja zahtjeva za spremanje
  if (!userStore.isAuthenticated || userStore.getUserRole !== 'admin') {
    console.warn("Pokušaj spremanja veterinara bez administratorskih ovlasti.");
    router.push('/prijava');
    return;
  }

  const token = userStore.token;
  const metoda = trenutniVeterinar.value ? "PUT" : "POST";
  const url = trenutniVeterinar.value
    ? `http://localhost:3000/admin/veterinari/${trenutniVeterinar.value.SIFRA_VETERINARA}`
    : "http://localhost:3000/admin/veterinari";

  // Ukloni lozinku iz bodyja ako je to PUT zahtjev i lozinka nije promijenjena
  // tj. ako nije nova lozinka eksplicitno unesena
  const dataToSend = { ...veterinar.value };
  if (metoda === 'PUT' && !dataToSend.lozinka_veterinara) {
      delete dataToSend.lozinka_veterinara; // Ne šalji praznu lozinku pri uređivanju
  }

  try {
    const res = await fetch(url, {
      method: metoda,
      body: JSON.stringify(dataToSend), // Šalji modificirani objekt
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Šaljemo JWT token
      }
    });

    if (res.status === 403 || res.status === 401) {
      console.error('Frontend: Pristup odbijen. Sesija istekla ili nema dozvolu za spremanje veterinara.');
      userStore.clearUser();
      router.push('/prijava');
      return;
    }

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.poruka || "Greška pri spremanju veterinara.");
    }

    dialogOtvoren.value = false;
    await fetchVeterinari(); // Osvježi listu nakon spremanja
    console.log("Veterinar uspješno spremljen.");
  } catch (err) {
    console.error("❌ Greška pri spremanju veterinara:", err.message);
  }
}

async function obrisiVeterinara(id) {
  // Provjera autorizacije prije slanja zahtjeva za brisanje
  if (!userStore.isAuthenticated || userStore.getUserRole !== 'admin') {
    console.warn("Pokušaj brisanja veterinara bez administratorskih ovlasti.");
    router.push('/prijava');
    return;
  }

  if (confirm("Jeste li sigurni da želite obrisati ovog veterinara?")) {
    const token = userStore.token;

    try {
      const res = await fetch(`http://localhost:3000/admin/veterinari/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Šaljemo JWT token
        }
      });

      if (res.status === 403 || res.status === 401) {
        console.error('Frontend: Pristup odbijen. Sesija istekla ili nema dozvolu za brisanje veterinara.');
        userStore.clearUser();
        router.push('/prijava');
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.poruka || "Greška pri brisanju veterinara.");
      }

      veterinari.value = veterinari.value.filter(v => v.SIFRA_VETERINARA !== id);
      console.log(`Veterinar ${id} uspješno obrisan.`);
    } catch (err) {
      console.error("❌ Greška pri brisanju veterinara:", err.message);
    }
  }
}

onMounted(fetchVeterinari);
</script>

<style scoped>
.veterinari-page {
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
