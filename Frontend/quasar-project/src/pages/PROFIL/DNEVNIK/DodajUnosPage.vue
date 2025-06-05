<template>
  <q-page class="q-pa-lg">
    <q-card class="q-pa-md q-mx-auto" style="max-width: 500px">
      <q-card-section>
        <div class="text-h4 podsjetnik-title">Dodaj unos u dnevnik</div>
      </q-card-section>

      <q-form @submit.prevent="submitEntry">
        <q-card-section class="q-gutter-md">
          <q-input v-model="entry.naziv_zapisa" label="Naziv zapisa" filled required />
          <q-input v-model="entry.tekst_zapisa" label="Tekst zapisa" filled type="textarea" />

          <q-input
            filled
            v-model="entry.datum_zapisa_display"
            mask="##.##.####" :rules="[val => (val && isValidDateDisplay(val)) || 'Datum mora biti u formatu DD.MM.YYYY. (npr. 05.06.2025.)']"
            label="Datum zapisa (DD.MM.YYYY.)"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date
                    v-model="entry.datum_zapisa_internal"
                    @update:model-value="val => entry.datum_zapisa_display = formatDateForDisplay(val)"
                    minimal
                  />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-input filled v-model="entry.vrijeme_zapisa" mask="##:##" :rules="['time']" label="Vrijeme zapisa">
            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-time v-model="entry.vrijeme_zapisa" format24h />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

        </q-card-section>

        <q-card-actions align="center">
          <q-btn label="Spremi unos" type="submit" color="primary" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { date } from 'quasar';

const router = useRouter();

// Pomoćna funkcija za formatiranje datuma iz Quasarovog internog formata (YYYY/MM/DD) u DD.MM.YYYY. za prikaz
// PROMIJENJENO: MAKUTA TOČKA NA KRAJU IZ FORMATA ZA format Date
const formatDateForDisplay = (quasarInternalDateString) => {
  if (!quasarInternalDateString) return '';
  return date.formatDate(quasarInternalDateString, 'DD.MM.YYYY'); // PROMIJENJENO: BEZ TOČKE NA KRAJU
};

// --- START DEBUGGING SECTION for isValidDateDisplay ---
const isValidDateDisplay = (dateString) => {
  console.log('DEBUG: isValidDateDisplay called with:', dateString); // Log 1: Ulazni string
  if (!dateString) {
    console.log('DEBUG: isValidDateDisplay failing: dateString is null/undefined.');
    return false;
  }
  // PROMIJENJENO: Očekivana dužina je SADA 10 (DD.MM.YYYY)
  if (dateString.length !== 10) {
    console.log('DEBUG: isValidDateDisplay failing: Length is not 10. Current length:', dateString.length);
    return false;
  }

  // PROMIJENJENO: Format za extractDate je SADA BEZ TOČKE NA KRAJU
  const parsed = date.extractDate(dateString, 'DD.MM.YYYY'); // PROMIJENJENO: BEZ TOČKE NA KRAJU
  console.log('DEBUG: Parsed date object from extractDate:', parsed);

  const isValid = date.isValid(parsed);
  console.log('DEBUG: Is parsed date valid according to Quasar date.isValid?', isValid);

  if (!isValid) {
    console.log('DEBUG: isValidDateDisplay returning FALSE because parsed date is not valid.');
    return false;
  }

  // Dodatna provjera: formatiraj parsed datum natrag u display format i usporedi s originalnim
  // PROMIJENJENO: Format za formatDate je SADA BEZ TOČKE NA KRAJU
  const reFormatted = date.formatDate(parsed, 'DD.MM.YYYY'); // PROMIJENJENO: BEZ TOČKE NA KRAJU
  console.log('DEBUG: Re-formatted date string from parsed object:', reFormatted);
  if (reFormatted !== dateString) {
      console.log('DEBUG: isValidDateDisplay failing: Original and re-formatted strings do not match. Original:', dateString, 'Re-formatted:', reFormatted);
      return false;
  }

  console.log('DEBUG: isValidDateDisplay returning TRUE. Date is valid and format matches.');
  return true;
};
// --- END DEBUGGING SECTION for isValidDateDisplay ---


// Funkcija za dohvaćanje trenutnog datuma u formatu DD.MM.YYYY. (za display)
// PROMIJENJENO: OVDJE TAKOĐER MAKUTA TOČKA NA KRAJU FORMATA
function getTodayDateDisplay() {
  const today = new Date();
  return date.formatDate(today, 'DD.MM.YYYY'); // PROMIJENJENO: BEZ TOČKE NA KRAJU
}

// Funkcija za dohvaćanje trenutnog datuma u Quasarovom internom formatu (YYYY/MM/DD)
function getTodayDateInternal() {
  const today = new Date();
  return date.formatDate(today, 'YYYY/MM/DD');
}

// Funkcija za dohvaćanje trenutnog vremena u formatu HH:MM
function getCurrentTime() {
  const today = new Date();
  return date.formatDate(today, 'HH:mm');
}

const entry = ref({
  naziv_zapisa: '',
  tekst_zapisa: '',
  datum_zapisa_internal: getTodayDateInternal(),
  datum_zapisa_display: getTodayDateDisplay(),
  vrijeme_zapisa: getCurrentTime()
});

function resetForm() {
  entry.value = {
    naziv_zapisa: '',
    tekst_zapisa: '',
    datum_zapisa_internal: getTodayDateInternal(),
    datum_zapisa_display: getTodayDateDisplay(),
    vrijeme_zapisa: getCurrentTime()
  };
}

async function submitEntry() {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/prijava');
    console.error('Niste prijavljeni. Molimo prijavite se.');
    return;
  }

  if (!isValidDateDisplay(entry.value.datum_zapisa_display)) {
      console.error('Greška: Unesen je neispravan format datuma. Molimo koristite DD.MM.YYYY.');
      return;
  }

  // KLJUČNO: Konvertiraj datum_zapisa_display (DD.MM.YYYY) u YYYY-MM-DD za backend
  // PROMIJENJENO: Format za extractDate je SADA BEZ TOČKE NA KRAJU
  const parsedDate = date.extractDate(entry.value.datum_zapisa_display, 'DD.MM.YYYY'); // PROMIJENJENO: BEZ TOČKE NA KRAJU
  const datumZaBackend = date.formatDate(parsedDate, 'YYYY-MM-DD');


  try {
    const podaciZaDnevnik = {
      naziv_zapisa: entry.value.naziv_zapisa,
      tekst_zapisa: entry.value.tekst_zapisa,
      datum_zapisa: datumZaBackend,
      vrijeme_zapisa: entry.value.vrijeme_zapisa
    };

    console.log("Dodavanje unosa u dnevnik: Slanje na backend:", podaciZaDnevnik);

    const res = await fetch('http://localhost:3000/dnevnik', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(podaciZaDnevnik)
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      router.push('/prijava');
      console.error('Sesija istekla ili token nevažeći. Molimo prijavite se ponovno.');
      return;
    }

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.poruka || 'Greška pri dodavanju unosa u dnevnik.');
    }

    console.log('Unos u dnevnik uspješno dodan!');
    resetForm();
    router.push('/dnevnik');
  } catch (e) {
    console.error('Greška pri dodavanju unosa u dnevnik:', e);
  }
}
</script>

<style scoped>
.podsjetnik-title {
  color: var(--q-primary);
  font-weight: bold;
  text-align: center;
}
</style>
