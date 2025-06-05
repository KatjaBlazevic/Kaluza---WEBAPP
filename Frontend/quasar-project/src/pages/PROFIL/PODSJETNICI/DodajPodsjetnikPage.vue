<template>
  <q-page class="q-pa-lg">
    <q-card class="q-pa-md q-mx-auto" style="max-width: 500px">
      <q-card-section>
        <div class="text-h4 podsjetnik-title">Dodaj podsjetnik</div>
      </q-card-section>

      <q-form @submit.prevent="submitReminder">
        <q-card-section class="q-gutter-md">
          <q-input v-model="reminder.naziv_podsjetnika" label="Naziv podsjetnika" filled required />
          <q-input v-model="reminder.opis_podsjetnika" label="Opis" filled type="textarea"/>

          <q-input
            v-model="reminder.datum_prikaz"
            label="Datum (DD.MM.YYYY.)"
            filled
            mask="##.##.####."
            :rules="[val => /^\d{2}\.\d{2}\.\d{4}\.$/.test(val) || 'Neispravan format datuma (DD.MM.YYYY.)']"
            required
            @blur="validateAndFormatDate"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="reminder.datum_backend" @update:model-value="updateDisplayDate" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Zatvori" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-input
            v-model="reminder.vrijeme_podsjetnika"
            label="Vrijeme (HH:MM)"
            filled
            mask="##:##"
            :rules="[val => /^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]$/.test(val) || 'Neispravan format vremena (HH:MM)']"
            required
            @blur="validateTimeFormat"
          >
            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-time v-model="reminder.vrijeme_podsjetnika" format24h> <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Zatvori" color="primary" flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-select v-model="reminder.tip_podsjetnika" :options="['dogadaj', 'termin', 'privatno']" label="Tip podsjetnika" filled/>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn label="Spremi podsjetnik" type="submit" color="primary" />
        </q-card-actions>
      </q-form>

      <q-card-section v-if="statusPoruka" class="text-center">
        <div
          :class="{
            'text-positive': statusBoja === 'green',
            'text-negative': statusBoja === 'red'
          }"
          class="text-subtitle2 q-mt-md"
        >
          {{ statusPoruka }}
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const reminder = ref({
  naziv_podsjetnika: '',
  opis_podsjetnika: '',
  datum_prikaz: '',
  datum_backend: '',
  vrijeme_podsjetnika: '', // Vrijeme ostaje HH:MM
  tip_podsjetnika: 'privatno'
})

const statusPoruka = ref('')
const statusBoja = ref('')

onMounted(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/prijava');
  }
});

const updateDisplayDate = (value) => {
  if (value) {
    const [year, month, day] = value.split('-');
    reminder.value.datum_prikaz = `${day}.${month}.${year}.`;
    reminder.value.datum_backend = value;
  } else {
    reminder.value.datum_prikaz = '';
    reminder.value.datum_backend = '';
  }
};

const validateAndFormatDate = () => {
  const dateString = reminder.value.datum_prikaz;
  const regex = /^(\d{2})\.(\d{2})\.(\d{4})\.$/;
  const match = dateString.match(regex);

  if (match) {
    const day = match[1];
    const month = match[2];
    const year = match[3];

    const date = new Date(`${year}-${month}-${day}`);
    if (date.getFullYear() == year && (date.getMonth() + 1) == month && date.getDate() == day) {
      reminder.value.datum_backend = `${year}-${month}-${day}`;
      statusPoruka.value = '';
    } else {
      statusPoruka.value = 'Neispravan datum (npr. 31.02.2024.).';
      statusBoja.value = 'red';
      reminder.value.datum_backend = '';
    }
  } else {
    statusPoruka.value = 'Molimo unesite datum u formatu DD.MM.YYYY.';
    statusBoja.value = 'red';
    reminder.value.datum_backend = '';
  }
};

// Nova funkcija za validaciju vremena (može se pozvati i na blur)
const validateTimeFormat = () => {
  const timeString = reminder.value.vrijeme_podsjetnika;
  const timeRegex = /^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]$/;
  if (!timeRegex.test(timeString)) {
    statusPoruka.value = 'Molimo unesite ispravno vrijeme u formatu HH:MM (24-satni format).';
    statusBoja.value = 'red';
  } else {
    statusPoruka.value = '';
  }
};


function resetForm() {
  reminder.value = {
    naziv_podsjetnika: '',
    opis_podsjetnika: '',
    datum_prikaz: '',
    datum_backend: '',
    vrijeme_podsjetnika: '',
    tip_podsjetnika: 'privatno'
  }
  statusPoruka.value = ''
  statusBoja.value = ''
}

async function submitReminder() {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/prijava');
    return;
  }

  if (!reminder.value.datum_backend) {
    statusPoruka.value = 'Molimo odaberite ili ispravno unesite datum.';
    statusBoja.value = 'red';
    return;
  }

  // Provjera vremena prije slanja
  const timeRegex = /^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]$/;
  if (!timeRegex.test(reminder.value.vrijeme_podsjetnika)) {
    statusPoruka.value = 'Molimo unesite ispravno vrijeme u formatu HH:MM (24-satni format).';
    statusBoja.value = 'red';
    return;
  }


  const podaciZaPodsjetnik = {
    naziv_podsjetnika: reminder.value.naziv_podsjetnika,
    opis_podsjetnika: reminder.value.opis_podsjetnika,
    datum_podsjetnika: reminder.value.datum_backend,
    vrijeme_podsjetnika: reminder.value.vrijeme_podsjetnika,
    tip_podsjetnika: reminder.value.tip_podsjetnika,
  };

  try {
    const res = await fetch('http://localhost:3000/podsjetnici', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(podaciZaPodsjetnik)
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      userStore.clearUser();
      router.push('/prijava');
      return;
    }

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.poruka || 'Greška pri dodavanju podsjetnika.');
    }

    statusPoruka.value = 'Podsjetnik uspješno dodan!';
    statusBoja.value = 'green';
    resetForm();
    router.push('/podsjetnici');
  } catch (e) {
    console.error('Greška pri dodavanju podsjetnika:', e);
    statusPoruka.value = e.message;
    statusBoja.value = 'red';
  }
}

</script>

<style scoped>
.podsjetnik-title{
    color: var(--q-primary);
    font-weight: bold;
    text-align: center;
}
</style>
