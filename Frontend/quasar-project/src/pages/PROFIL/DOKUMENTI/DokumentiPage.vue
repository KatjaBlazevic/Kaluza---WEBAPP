<template>
  <q-page class="documents-page">
    <div class="hero-section flex flex-center">
      <div class="hero-content text-center text-white">
        <h1 class="hero-title">Moji Dokumenti</h1>
        <q-btn unelevated label="DODAJ DOKUMENT" color="white" text-color="dark" size="lg" class="add-document-btn q-mt-md" @click="openAddDialog" />
      </div>
    </div>

    <div class="main-content">
      <div class="q-pa-md row q-gutter-md items-center">
        <q-input outlined v-model="searchQuery" placeholder="Pretraži dokumente po imenu ljubimca, cjepivima ili lijekovima..." class="search-input col-grow">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div v-if="filteredDocuments.length > 0">
        <div class="documents-section">
          <div class="row justify-center q-gutter-md">
            <div v-for="document in (showAll ? filteredDocuments : filteredDocuments.slice(0, 3))"
                 :key="document.SIFRA_DOKUMENTA"
                 class="document-card col-xs-12 col-sm-6 col-md-4">
              <q-card-section class="text-left">
                <h3 class="document-title flex items-center">
                  <q-icon name="description" class="q-mr-sm text-primary" />
                  <span v-if="!document.editMode">{{ document.ime_ljubimca }}</span>
                  <q-select
                    v-else
                    v-model="document.SIFRA_LJUBIMCA"
                    :options="petOptions"
                    option-value="SIFRA_LJUBIMCA"
                    option-label="ime_ljubimca"
                    label="Ljubimac"
                    emit-value
                    map-options
                    dense
                    outlined
                  />
                </h3>

                <p class="document-details q-mt-sm">
                  <strong>Cjepiva:</strong>
                  <span v-if="!document.editMode">{{ document.cijepiva_ljubimca || 'Nije uneseno' }}</span>
                  <q-input v-else v-model="document.cijepiva_ljubimca" dense outlined type="textarea" rows="2" class="q-mt-sm" />
                </p>
                <p class="document-details">
                  <strong>Lijekovi:</strong>
                  <span v-if="!document.editMode">{{ document.lijekovi_ljubimca || 'Nije uneseno' }}</span>
                  <q-input v-else v-model="document.lijekovi_ljubimca" dense outlined type="textarea" rows="2" class="q-mt-sm" />
                </p>

                <div class="document-files q-mt-md">
                  <p v-if="document.putovnica_ljubimca">
                    <q-btn flat dense icon="picture_as_pdf" label="Putovnica" color="accent" @click="viewFile(document.putovnica_ljubimca, 'Putovnica.pdf')" />
                  </p>
                  <p v-if="document.rodovnica_ljubimca">
                    <q-btn flat dense icon="picture_as_pdf" label="Rodovnica" color="accent" @click="viewFile(document.rodovnica_ljubimca, 'Rodovnica.pdf')" />
                  </p>

                  <div v-if="document.editMode" class="q-mt-md">
                    <q-file v-model="document.new_putovnica" label="Nova putovnica (PDF, JPG, PNG)" accept=".pdf, .jpg, .jpeg, .png" outlined dense clearable>
                      <template v-slot:prepend>
                        <q-icon name="cloud_upload" />
                      </template>
                    </q-file>
                    <q-file v-model="document.new_rodovnica" label="Nova rodovnica (PDF, JPG, PNG)" accept=".pdf, .jpg, .jpeg, .png" outlined dense clearable class="q-mt-sm">
                      <template v-slot:prepend>
                        <q-icon name="cloud_upload" />
                      </template>
                    </q-file>
                  </div>
                </div>

                <div class="document-actions q-mt-md flex justify-around">
                  <q-btn flat dense icon="edit" :label="document.editMode ? 'Spremi' : 'Uredi'" color="primary"
                    @click="toggleEdit(document)" />
                  <q-btn flat dense icon="delete" label="Obriši" color="negative"
                    @click="deleteDocument(document.SIFRA_DOKUMENTA)" />
                </div>
              </q-card-section>
            </div>
          </div>
        </div>

        <div class="q-mt-lg text-center">
          <q-btn v-if="filteredDocuments.length > 3" @click="toggleShowAll" flat color="primary">
            {{ showAll ? 'Prikaži manje' : 'Prikaži više' }}
          </q-btn>
        </div>
      </div>
      <div v-else class="text-center q-pa-md">
        <p class="text-h6 text-grey-7">Nema pronađenih dokumenata.</p>
        <p class="text-grey-6">Dodajte novi dokument ili prilagodite pretragu.</p>
      </div>
    </div>

    <q-dialog v-model="showAddDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Dodaj Novi Dokument</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select
            v-model="newDocument.SIFRA_LJUBIMCA"
            :options="petOptions"
            option-value="SIFRA_LJUBIMCA"
            option-label="ime_ljubimca"
            label="Odaberite ljubimca"
            emit-value
            map-options
            outlined
            dense
            class="q-mb-md"
          />
          <q-input v-model="newDocument.cijepiva_ljubimca" label="Cjepiva (opis)" type="textarea" rows="2" outlined dense class="q-mb-md" />
          <q-input v-model="newDocument.lijekovi_ljubimca" label="Lijekovi (opis)" type="textarea" rows="2" outlined dense class="q-mb-md" />
          <q-file v-model="newDocument.putovnica_ljubimca" label="Učitaj Putovnicu (PDF, JPG, PNG)" accept=".pdf, .jpg, .jpeg, .png" outlined dense class="q-mb-md">
            <template v-slot:prepend>
              <q-icon name="cloud_upload" />
            </template>
          </q-file>
          <q-file v-model="newDocument.rodovnica_ljubimca" label="Učitaj Rodovnicu (PDF, JPG, PNG)" accept=".pdf, .jpg, .jpeg, .png" outlined dense>
            <template v-slot:prepend>
              <q-icon name="cloud_upload" />
            </template>
          </q-file>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" color="negative" v-close-popup />
          <q-btn flat label="Dodaj" color="primary" @click="addDocument" :disable="!newDocument.SIFRA_LJUBIMCA" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
// Uklonjen import za useQuasar
import { useUserStore } from '@/stores/user';

const documents = ref([]);
const petOptions = ref([]);
const showAll = ref(false);
const searchQuery = ref('');
const router = useRouter();
const userStore = useUserStore();
const showAddDialog = ref(false);
const newDocument = ref({
  SIFRA_LJUBIMCA: null,
  cijepiva_ljubimca: '',
  lijekovi_ljubimca: '',
  putovnica_ljubimca: null,
  rodovnica_ljubimca: null,
});

// 📌 Filtriranje dokumenata
const filteredDocuments = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return documents.value.filter(doc =>
    (doc.ime_ljubimca && doc.ime_ljubimca.toLowerCase().includes(query)) ||
    (doc.cijepiva_ljubimca && doc.cijepiva_ljubimca.toLowerCase().includes(query)) ||
    (doc.lijekovi_ljubimca && doc.lijekovi_ljubimca.toLowerCase().includes(query))
  );
});

// 📌 Prikaži više/manje dokumenata
function toggleShowAll() {
  showAll.value = !showAll.value;
}

// 📌 Prikaz datoteke (Base64 u PDF/sliku)
function viewFile(base64String, filename) {
  if (!base64String) {
    console.warn('Datoteka nije dostupna za pregled.');
    return;
  }

  // Odredite MIME tip na temelju prvih znakova Base64 stringa
  let mimeType;
  if (base64String.startsWith('/9j/') || base64String.startsWith('iVBORw0KGgo')) {
    mimeType = 'image/jpeg'; // ili image/png
  } else if (base64String.startsWith('JVBERi0x')) {
    mimeType = 'application/pdf';
  } else {
    // Pokušaj pogoditi na temelju ekstenzije, ako filename postoji
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') mimeType = 'application/pdf';
    else if (['jpg', 'jpeg'].includes(ext)) mimeType = 'image/jpeg';
    else if (ext === 'png') mimeType = 'image/png';
    else mimeType = 'application/octet-stream'; // Default ako ne prepoznamo
  }

  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  const url = URL.createObjectURL(blob);

  window.open(url, '_blank');
}


// 📌 Dohvaćanje dokumenata
async function fetchDocuments() {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/prijava');
    console.error('Niste prijavljeni. Molimo prijavite se.');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/dokument', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      userStore.clearUser();
      router.push('/prijava');
      console.error('Sesija istekla ili token nevažeći. Molimo prijavite se ponovno.');
      return;
    }

    if (!res.ok) {
      throw new Error(`Greška pri dohvaćanju: ${res.statusText}`);
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("API nije vratio niz dokumenata!");
    }

    documents.value = data.map(doc => ({
      ...doc,
      editMode: false,
      new_putovnica: null,
      new_rodovnica: null,
    }));

  } catch (err) {
    console.error("Greška pri dohvaćanju dokumenata:", err);
  }
}

// 📌 Dohvaćanje ljubimaca za dropdown
async function fetchPets() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Niste prijavljeni. Ne mogu dohvatiti ljubimce.');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/moji-ljubimci', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error(`Greška pri dohvaćanju ljubimaca: ${res.statusText}`);
    }

    const data = await res.json();
    petOptions.value = data;
  } catch (err) {
    console.error("Greška pri dohvaćanju ljubimaca za odabir:", err);
  }
}

// 📌 Otvaranje/zatvaranje dijaloga za dodavanje
function openAddDialog() {
  newDocument.value = {
    SIFRA_LJUBIMCA: null,
    cijepiva_ljubimca: '',
    lijekovi_ljubimca: '',
    putovnica_ljubimca: null,
    rodovnica_ljubimca: null,
  };
  showAddDialog.value = true;
}

// 📌 Omogućivanje uređivanja dokumenta i spremanje
async function toggleEdit(document) {
  if (document.editMode) {
    await updateDocument(document);
    await fetchDocuments(); // Osvježi podatke nakon ažuriranja
  } else {
    // Kada ulazimo u edit mode, provjeri je li ime ljubimca u dropdownu
    // i postavi ga ako nije (prvi put ulazimo u edit mode)
    if (document.SIFRA_LJUBIMCA && !petOptions.value.find(p => p.SIFRA_LJUBIMCA === document.SIFRA_LJUBIMCA)) {
       // Ako ljubimac nije u opcijama (npr. obrisan je), pokušaj dohvatiti ponovno ili resetirati
       await fetchPets(); // Pokušaj dohvatiti ponovno za svaki slučaj
    }
  }
  document.editMode = !document.editMode;
}

// 📌 Ažuriranje dokumenta
async function updateDocument(document) {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/prijava');
    console.error('Niste prijavljeni. Molimo prijavite se.');
    return;
  }

  const formData = new FormData();
  formData.append('cijepiva_ljubimca', document.cijepiva_ljubimca || '');
  formData.append('lijekovi_ljubimca', document.lijekovi_ljubimca || '');

  if (document.new_putovnica) {
    formData.append('putovnica_ljubimca', document.new_putovnica);
  }
  if (document.new_rodovnica) {
    formData.append('rodovnica_ljubimca', document.new_rodovnica);
  }

  console.log("Frontend šalje na PUT (Dokument):", formData);

  try {
    const response = await fetch(`http://localhost:3000/dokument/${document.SIFRA_DOKUMENTA}`, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token');
      userStore.clearUser();
      router.push('/prijava');
      console.error('Sesija istekla ili token nevažeći. Molimo prijavite se ponovno.');
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Greška servera: ${errorData.poruka || response.statusText}`);
    }

    console.log("Dokument uspješno ažuriran!");
    document.new_putovnica = null; // Resetiraj odabrane datoteke nakon uspješnog slanja
    document.new_rodovnica = null;
  } catch (err) {
    console.error("Greška pri ažuriranju dokumenta:", err);
  }
}

// 📌 Dodavanje dokumenta
async function addDocument() {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/prijava');
    console.error('Niste prijavljeni. Molimo prijavite se.');
    return;
  }

  const formData = new FormData();
  formData.append('SIFRA_LJUBIMCA', newDocument.value.SIFRA_LJUBIMCA);
  formData.append('cijepiva_ljubimca', newDocument.value.cijepiva_ljubimca || '');
  formData.append('lijekovi_ljubimca', newDocument.value.lijekovi_ljubimca || '');

  if (newDocument.value.putovnica_ljubimca) {
    formData.append('putovnica_ljubimca', newDocument.value.putovnica_ljubimca);
  }
  if (newDocument.value.rodovnica_ljubimca) {
    formData.append('rodovnica_ljubimca', newDocument.value.rodovnica_ljubimca);
  }

  console.log("Frontend šalje na POST (Dokument):", newDocument.value);

  try {
    const response = await fetch('http://localhost:3000/dokument', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token');
      userStore.clearUser();
      router.push('/prijava');
      console.error('Sesija istekla ili token nevažeći. Molimo prijavite se ponovno.');
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Greška servera: ${errorData.poruka || response.statusText}`);
    }

    const result = await response.json();
    console.log(result.poruka); // Ispis poruke u konzolu
    showAddDialog.value = false;
    await fetchDocuments(); // Osvježi listu dokumenata
  } catch (err) {
    console.error("Greška pri dodavanju dokumenta:", err);
  }
}

// 📌 Brisanje dokumenta
async function deleteDocument(id) {
  if (!confirm('Jeste li sigurni da želite obrisati ovaj dokument?')) {
    return; // Korisnik je odustao
  }

  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/prijava');
    console.error('Niste prijavljeni. Molimo prijavite se.');
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/dokument/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token');
      userStore.clearUser();
      router.push('/prijava');
      console.error('Sesija istekla ili token nevažeći. Molimo prijavite se ponovno.');
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Greška servera: ${errorData.poruka || response.statusText}`);
    }

    console.log('Dokument uspješno obrisan!');
    await fetchDocuments();
  } catch (err) {
    console.error('Greška pri brisanju dokumenta:', err);
  }
}

onMounted(() => {
  fetchDocuments();
  fetchPets();
});
</script>

<style scoped>
/* Vaši postojeći stilovi, promijenjene klase reminders-section u documents-section i reminder-card u document-card */
.documents-page {
  background-color: white;
}

.hero-section {
  height: 70vh;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1)), url('/hero_onama.png'); /* Provjerite putanju slike */
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

.search-input {
  margin-bottom: 30px;
  border-radius: 15px;
}

.documents-section {
  background: var(--q-secondary); /* Provjerite je li --q-secondary definiran u vašem Quasar temu */
  border-radius: 15px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.document-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  width: 350px;
  text-align: left;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.document-title {
  font-size: 1.3rem;
  font-weight: bold;
  line-height: 1.7;
  color: var(--q-dark); /* Provjerite je li --q-dark definiran */
}

.document-details {
  font-size: 0.95em;
  color: #555;
  margin-bottom: 5px;
}

.document-actions .q-btn {
  min-width: unset;
}

/* Responsivni stilovi */
@media (max-width: 1023px) {
  .hero-title {
    font-size: 2rem;
  }

  .main-content {
    padding: 60px 5%;
  }

  .documents-section {
    padding: 30px;
  }

  .document-card {
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

  .documents-section {
    padding: 20px;
  }

  .search-input {
    width: 100%;
  }
}
</style>
