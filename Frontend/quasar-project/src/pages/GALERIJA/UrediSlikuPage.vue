<template>
  <q-page class="uredi-sliku-page">
    <q-card v-if="imageData" class="image-form">
      <q-card-section>
        <h2 class="form-title">Uredi sliku</h2>

        <q-input v-model="imageData.naziv_slike" label="Naziv slike" outlined />
        <q-input v-model="imageData.opis_slike" label="Opis slike" outlined type="textarea" />

        <div class="buttons">
          <q-btn label="Spremi promjene" color="primary" @click="updateImage" />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const imageData = ref(null);

const fetchImage = async () => {
  try {
    const res = await fetch(`http://localhost:3000/slika/${route.params.SIFRA_SLIKE}`);
    if (!res.ok) throw new Error('Slika nije pronađena.');

    imageData.value = await res.json();
  } catch (err) {
    console.error('Greška pri dohvaćanju slike:', err);
  }
};

const updateImage = async () => {
  try {
    const res = await fetch(`http://localhost:3000/slika/${route.params.SIFRA_SLIKE}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        naziv_slike: imageData.value.naziv_slike,
        opis_slike: imageData.value.opis_slike
      }),
    });

    const data = await res.json();
    router.push('/galerija');
  } catch (err) {
    console.error('Greška pri ažuriranju slike:', err);
  }
};


onMounted(fetchImage);
</script>

<style scoped>
.uredi-sliku-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.image-form {
  width: 60%;
  padding: 2rem;
  background: white;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  border-radius: 15px;
}

.form-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  text-align: center;
}

.buttons {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}
</style>
