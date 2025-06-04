<template>
  <q-page class="dokumenti-page">
    <div class="hero-section flex flex-center">
      <div class="hero-content text-center text-white">
        <h1 class="hero-title">Dokumenti mojih ljubimaca</h1>
        <q-btn unelevated label="DODAJ DOKUMENT" color="white" text-color="dark" size="lg" class="add-document-btn q-mt-md" @click="showAddDialog = true"/>
      </div>
    </div>

    <div class="main-content">
      <div v-if="dokumenti.length > 0">
        <div class="dokumenti-section">
          <div class="row justify-center q-gutter-xl">
            <div v-for="dok in (showAll ? dokumenti : dokumenti.slice(0, 3))"
                 :key="dok.SIFRA_DOKUMENTA"
                 class="dokument-card">
              <q-card-section class="text-center">
                <h3 class="dokument-title">Dokument za: {{ dok.ime_ljubimca }}</h3>

                <p class="dokument-details text-grey-8">
                  <q-icon name="badge" class="q-mr-xs" />
                  Putovnica:
                  <span v-if="dok.putovnica_ljubimca">
                    <a :href="dok.putovnica_ljubimca" target="_blank">Otvori PDF</a>
                  </span>
                  <span v-else>Nije uneseno</span>
                </p>

                <p class="dokument-details text-grey-8">
                  <q-icon name="family_restroom" class="q-mr-xs" />
                  Rodovnica:
                  <span v-if="dok.rodovnica_ljubimca">
                    <a :href="dok.rodovnica_ljubimca" target="_blank">Otvori PDF</a>
                  </span>
                  <span v-else>Nije uneseno</span>
                </p>

                <p class="dokument-details q-mt-xs text-grey-8">
                  <q-icon name="assignment" class="q-mr-xs" /> Cijepiva: {{ dok.cijepiva_ljubimca }}
                </p>
                <p class="dokument-details text-grey-8">
                  <q-icon name="medication" class="q-mr-xs" /> Lijekovi: {{ dok.lijekovi_ljubimca }}
                </p>

                <div class="dokument-actions q-mt-md flex justify-around">
                  <q-btn flat dense icon="edit" label="Uredi" color="primary" @click="openEditDialog(dok)" />
                  <q-btn flat dense icon="delete" label="Obriši" color="negative" @click="deleteDokument(dok.SIFRA_DOKUMENTA)" />
                </div>
              </q-card-section>
            </div>
          </div>
        </div>

        <div class="text-center q-mt-md">
          <q-btn v-if="dokumenti.length > 3" @click="showAll = !showAll" :label="showAll ? 'Prikaži manje' : 'Prikaži više'" color="primary" />
        </div>
      </div>
      <div v-else class="text-center q-mt-xl">
        <p class="text-h6 text-dark">Nema dostupnih dokumenata.</p>
      </div>
    </div>

    <!-- Dijalog za dodavanje dokumenta -->
    <q-dialog v-model="showAddDialog">
      <q-card style="width: 500px;">
        <q-card-section>
          <h2>Dodaj novi dokument</h2>
        </q-card-section>
        <q-card-section>
          <q-select v-model="noviDokument.SIFRA_LJUBIMCA"
          :options="ljubimciOptions"
          label="Odaberi ljubimca"
          emit-value
          map-options
          @update:model-value="updateLjubimacSelection" />
          <q-input v-model="noviDokument.cijepiva_ljubimca" label="Cijepiva" outlined />
          <q-input v-model="noviDokument.lijekovi_ljubimca" label="Lijekovi" outlined />
          <q-file label="Putovnica (PDF)" filled @change="handleFileUpload($event, 'putovnica_ljubimca')" />
          <q-file label="Rodovnica (PDF)" filled @change="handleFileUpload($event, 'rodovnica_ljubimca')" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Odustani" flat @click="showAddDialog = false" />
          <q-btn label="Spremi" color="primary" @click="submitDokument" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dijalog za uređivanje dokumenta -->
    <q-dialog v-model="showEditDialog">
      <q-card style="width: 500px;">
        <q-card-section>
          <h2>Uredi dokument</h2>
        </q-card-section>
        <q-card-section>
          <q-input v-model="editDokumentData.cijepiva_ljubimca" label="Cijepiva" outlined />
          <q-input v-model="editDokumentData.lijekovi_ljubimca" label="Lijekovi" outlined />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Odustani" flat @click="showEditDialog = false" />
          <q-btn label="Spremi" color="primary" @click="saveEditDokument" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const ljubimciOptions = ref([]);
const dokumenti = ref([]);
const showAll = ref(false);
const showAddDialog = ref(false);
const showEditDialog = ref(false);
const editDokumentData = ref(null);

const noviDokument = ref({
  cijepiva_ljubimca: '',
  lijekovi_ljubimca: '',
  putovnica_ljubimca: '',
  rodovnica_ljubimca: ''
});

// 📌 Dohvati ljubimce prijavljenog korisnika
async function fetchLjubimci() {
  try {
    const res = await fetch('http://localhost:3000/moji-ljubimci', {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) {
      throw new Error('❌ Greška pri dohvaćanju ljubimaca.');
    }

    const data = await res.json();

    // ✅ Ispravno formatiranje za Vue `q-select`
    ljubimciOptions.value = data.map(lj => ({
      label: lj.ime_ljubimca,   // 👈 Koristi pravo ime ljubimca
      value: lj.SIFRA_LJUBIMCA  // 👈 Koristi šifru ljubimca za backend
    }));

  } catch (err) {
    console.error('❌ Greška pri dohvaćanju ljubimaca:', err);
  }
}


// 📌 Dohvat dokumenata—sada sigurno definiran prije poziva
async function fetchDokumenti() {
  try {
    const res = await fetch('http://localhost:3000/dokument', {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) {
      throw new Error('❌ Greška pri dohvaćanju dokumenata.');
    }

    dokumenti.value = await res.json();
  } catch (err) {
    console.error('❌ Greška pri dohvaćanju dokumenata:', err);
  }
}

// 📌 Funkcija za otvaranje prozora za uređivanje
function openEditDialog(dok) {
  editDokumentData.value = { ...dok };
  showEditDialog.value = true;
}

// 📌 Funkcija za spremanje uređivanja
async function saveEditDokument() {
  const requestData = {
    cijepiva_ljubimca: editDokumentData.value.cijepiva_ljubimca || "",
    lijekovi_ljubimca: editDokumentData.value.lijekovi_ljubimca || "",
    putovnica_ljubimca: editDokumentData.value.putovnica_ljubimca || null, // ✅ Sprema `null` ako je prazno
    rodovnica_ljubimca: editDokumentData.value.rodovnica_ljubimca || null  // ✅ Sprema `null` ako je prazno
  };

  try {
    const response = await fetch(`http://localhost:3000/dokument/${editDokumentData.value.SIFRA_DOKUMENTA}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error("❌ Greška pri ažuriranju dokumenta.");
    }

    console.log("✅ Dokument uspješno ažuriran!");
    showEditDialog.value = false;
    await fetchDokumenti();
  } catch (err) {
    console.error("❌ Greška pri ažuriranju dokumenta:", err);
  }
}


async function submitDokument() {

  try {
    const response = await fetch('http://localhost:3000/dokument', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(noviDokument.value)
    });

    if (!response.ok) {
      throw new Error("❌ Greška servera pri dodavanju dokumenta.");
    }

    showAddDialog.value = false;
    await fetchDokumenti();
  } catch (err) {
    console.error("❌ Greška pri dodavanju dokumenta:", err);
  }
}

// 📌 Brisanje dokumenta
async function deleteDokument(id) {
  if (!confirm("Jeste li sigurni da želite obrisati dokument?")) return;

  try {
    const response = await fetch(`http://localhost:3000/dokument/${id}`, {
      method: "DELETE",
      credentials: "include"
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`❌ Greška servera pri brisanju dokumenta: ${errorData.poruka || response.statusText}`);
    }

    console.log("✅ Dokument uspješno obrisan!");
    await fetchDokumenti(); // Osveži prikaz dokumenata
  } catch (err) {
    console.error("❌ Greška pri brisanju dokumenta:", err);
  }
}

function updateLjubimacSelection(value) {
  noviDokument.value.SIFRA_LJUBIMCA = value;
  console.log("📌 Postavljen ljubimac:", noviDokument.value.SIFRA_LJUBIMCA);
}

onMounted(() => {
  fetchDokumenti();
  fetchLjubimci();
});

</script>


<style scoped>
.dokumenti-page {
  background-color: white;
}

.hero-section {
  height: 70vh;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1)), url('hero_pocetna.avif');
  background-size: cover;
  background-position: center;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 3rem;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.add-document-btn {
  background: white !important;
  border-radius: 15px !important;
  padding: 10px 20px !important;
  font-weight: bold;
}

.main-content {
  padding: 80px 10%;
  margin-top: -50px;
  position: relative;
  z-index: 1;
  background-color: white;
}

.dokumenti-section {
  background: var(--q-secondary);
  border-radius: 15px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.dokument-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  width: 300px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.dokument-title {
  font-size: 1.2rem;
  font-weight: bold;
  line-height: 1.7;
  color: var(--q-dark);
}

.dokument-details {
  font-size: 0.95rem;
  color: var(--q-dark);
}

/* Responsivni stilovi */
@media (max-width: 1023px) {
  .hero-title {
    font-size: 2rem;
  }

  .main-content {
    padding: 60px 5%;
  }

  .dokumenti-section {
    padding: 30px;
  }

  .dokument-card {
    width: 100%;
    max-width: 350px;
    margin-bottom: 20px;
  }
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 1.8rem;
  }

  .main-content {
    padding: 50px 20px;
    margin-top: -30px;
    border-radius: 20px 20px 0 0;
  }

  .dokumenti-section {
    padding: 20px;
  }
}
</style>
