<template>
  <q-page class="dogadaji-page">
    <div class="q-pa-md">
      <h1>Upravljanje Događajima</h1>

      <div class="gumb-container">
        <q-btn color="primary" label="Dodaj događaj" @click="otvoriDodavanje" class="q-mb-md" /></div>
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

    <!-- Iskočni prozor za dodavanje / uređivanje događaja -->
    <q-dialog v-model="dialogOtvoren">
      <q-card class="q-pa-md">
        <q-card-section>
          <h2>{{ trenutniDogadaj ? 'Uredi' : 'Dodaj' }} Događaj</h2>
        </q-card-section>

        <q-card-section>
          <q-input v-model="dogadaj.naziv_dogadaja" label="Naziv događaja" />
          <q-input v-model="dogadaj.vrsta_dogadaja" label="Vrsta događaja" />
          <q-input v-model="dogadaj.opis_dogadaja" label="Opis događaja" />
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
  return dogadaji.value.filter(d => {
    const datumDogadaja = new Date(d.datum_dogadaja);
    const danas = new Date();

    if (prikaziSamoAktivne.value) return datumDogadaja >= danas;
    if (prikaziProsleDogadaje.value) return datumDogadaja < danas;

    return true;
  }).filter(dogadaj =>
    Object.values(dogadaj).some(vrijednost =>
      vrijednost.toString().toLowerCase().includes(pretraga.value.toLowerCase())
    )
  );
});

const brojAktivnihDogadaja = computed(() => {
  return dogadaji.value.filter(d => new Date(d.datum_dogadaja) >= new Date()).length;
});


function formatirajDatum(datum) {
  const d = new Date(datum);
  return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}.${d.getFullYear().toString().slice(-2)}`;
}

function formatirajVrijeme(vrijeme) {
  return vrijeme.substring(0, 5); // Uzima samo HH:mm format
}

async function fetchDogadaji() {
  try {
    const res = await fetch("http://localhost:3000/admin/dogadaji", { method: "GET", credentials: "include" });
    if (!res.ok) throw new Error("Greška pri dohvaćanju događaja.");
    dogadaji.value = await res.json();
  } catch (err) {
    console.error("Greška pri dohvaćanju događaja:", err);
  }
}

function otvoriDodavanje() {
  dogadaj.value = {};
  trenutniDogadaj.value = null;
  dialogOtvoren.value = true;
}

function otvoriUredivanje(dogadajZaUrediti) {
  trenutniDogadaj.value = dogadajZaUrediti;
  dogadaj.value = { ...dogadajZaUrediti };

  // Konverzija datuma i vremena za prikaz u input poljima
  dogadaj.value.datum_dogadaja = new Date(dogadajZaUrediti.datum_dogadaja).toISOString().split("T")[0];
  dogadaj.value.vrijeme_dogadaja = dogadajZaUrediti.vrijeme_dogadaja.substring(0, 5); // HH:mm format

  dialogOtvoren.value = true;
}


async function spremiDogadaj() {
  const metoda = trenutniDogadaj.value ? "PUT" : "POST";
  const url = trenutniDogadaj.value
    ? `http://localhost:3000/admin/dogadaji/${trenutniDogadaj.value.SIFRA_DOGADAJA}`
    : "http://localhost:3000/admin/dogadaji";

  try {
    const res = await fetch(url, { method: metoda, body: JSON.stringify(dogadaj.value), headers: { "Content-Type": "application/json" }, credentials: "include" });
    if (!res.ok) throw new Error("Greška pri spremanju događaja.");
    dialogOtvoren.value = false;
    fetchDogadaji();
  } catch (err) {
    console.error("Greška pri spremanju događaja:", err);
  }
}

async function obrisiDogadaj(id) {
  if (confirm("Jeste li sigurni da želite obrisati ovaj događaj?")) {
    try {
      const res = await fetch(`http://localhost:3000/admin/dogadaji/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Greška pri brisanju događaja.");
      dogadaji.value = dogadaji.value.filter(d => d.SIFRA_DOGADAJA !== id);
    } catch (err) {
      console.error("Greška pri brisanju događaja:", err);
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
