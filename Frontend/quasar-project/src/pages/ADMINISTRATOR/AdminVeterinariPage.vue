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

    <!-- Iskočni prozor za dodavanje / uređivanje veterinarâ -->
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
          <q-input v-model="veterinar.lozinka_veterinara" label="Lozinka"/>
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
import { ref,computed, onMounted } from "vue";

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
  lozinka_veterinara:"",
  specijalizacija_veterinara: ""
});

const columns = [
  { name: "ime", label: "Ime", align: "left", field: "ime_veterinara" },
  { name: "prezime", label: "Prezime", align: "left", field: "prezime_veterinara" },
  { name: "kontakt", label: "Kontakt", align: "left", field: "kontakt_veterinara" },
  { name: "lokacija", label: "Lokacija", align: "left", field: "lokacija_veterinara" },
  { name: "email", label: "Email", align: "left", field: "email_veterinara" },
  { name: "lozinka", label: "Lozinka", align: "left", field: "lozinka_veterinara" },
  { name: "specijalizacija", label: "Specijalizacija", align: "left", field: "specijalizacija_veterinara" },
  { name: "akcije", label: "Akcije", align: "center" }
];

async function fetchVeterinari() {
  try {
    const res = await fetch("http://localhost:3000/admin/veterinari", { method: "GET", credentials: "include" });
    if (!res.ok) throw new Error("Greška pri dohvaćanju veterinarâ.");
    veterinari.value = await res.json();
  } catch (err) {
    console.error("Greška pri dohvaćanju veterinarâ:", err);
  }
}
const filtriraniVeterinari = computed(() => {
  return veterinari.value.filter(veterinar =>
    Object.values(veterinar).some(vrijednost =>
      vrijednost.toString().toLowerCase().includes(pretraga.value.toLowerCase())
    )
  );
});

function otvoriDodavanje() {
  veterinar.value = {};
  trenutniVeterinar.value = null;
  dialogOtvoren.value = true;
}

function otvoriUredivanje(veterinarZaUrediti) {
  trenutniVeterinar.value = veterinarZaUrediti;
  veterinar.value = { ...veterinarZaUrediti };
  dialogOtvoren.value = true;
}

async function spremiVeterinara() {
  const metoda = trenutniVeterinar.value ? "PUT" : "POST";
  const url = trenutniVeterinar.value
    ? `http://localhost:3000/admin/veterinari/${trenutniVeterinar.value.SIFRA_VETERINARA}`
    : "http://localhost:3000/admin/veterinari";

  try {
    const res = await fetch(url, {
      method: metoda,
      body: JSON.stringify(veterinar.value),
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });

    if (!res.ok) throw new Error("Greška pri spremanju veterinara.");
    dialogOtvoren.value = false;
    fetchVeterinari();
  } catch (err) {
    console.error("Greška pri spremanju veterinara:", err);
  }
}

async function obrisiVeterinara(id) {
  if (confirm("Jeste li sigurni da želite obrisati ovog veterinara?")) {
    try {
      const res = await fetch(`http://localhost:3000/admin/veterinari/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Greška pri brisanju veterinara.");
      veterinari.value = veterinari.value.filter(v => v.SIFRA_VETERINARA !== id);
    } catch (err) {
      console.error("Greška pri brisanju veterinara:", err);
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
  padding-top: 40px;
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
