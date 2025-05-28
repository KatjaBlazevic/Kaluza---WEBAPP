<template>
  <q-page class="slika-page">
    <q-card v-if="imageData" class="image-detail">
      <div class="content">
        <!-- Sekcija slike -->
        <q-img :src="imageData.slika" class="detail-image" />

        <!-- Sekcija informacija -->
        <div class="info-container">
          <q-card-section>
            <div class="text-center">
              <p class="info-title text-dark"><strong>Naziv</strong></p>
              <h2 class="image-title">{{ imageData.naziv_slike }}</h2>
            </div>

            <div class="text-center">
              <p class="info-title text-dark"><strong>Opis</strong></p>
              <p class="image-description">{{ imageData.opis_slike }}</p>
            </div>

            <div class="text-center">
              <p class="info-title text-dark"><strong>Datum</strong></p>
              <p class="image-date">{{ imageData.datum_objave }}</p>
            </div>

            <div class="buttons">
              <q-btn label="Uredi" color="accent" class="edit-btn" @click="editImage" />
              <q-btn label="Obriši" color="accent" class="delete-btn" @click="deleteImage" />
            </div>
          </q-card-section>
        </div>
      </div>
    </q-card>

    <div v-else class="loading text-center">
      <p class="text-h6 text-dark">🔄 Učitavanje slike...</p>
    </div>
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

const editImage = () => {
  router.push(`/slika/${route.params.SIFRA_SLIKE}/uredi`);
};

// Funkcija za brisanje slike s potvrdom
const deleteImage = async () => {
  if (!confirm('Jeste li sigurni da želite obrisati ovu sliku?')) {
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/slika/${route.params.SIFRA_SLIKE}`, { method: 'DELETE' });

    if (!res.ok) throw new Error('Neuspješno brisanje slike.');

    console.log('🗑️ Slika uspješno obrisana!');
    router.push('/galerija');
  } catch (err) {
    console.error('Greška pri brisanju slike:', err);
  }
};

onMounted(fetchImage);
</script>

<style scoped>
.slika-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.image-detail {
  display: flex;
  width: 80%;
  background: white;
  box-shadow: 0 5px 15px rgba(0,0,0,0);
  border-radius: 15px;
  overflow: hidden;
}

.content {
  display: flex;
  align-items: stretch;
  max-height: 70vh;
}

.detail-image {
  width: 50%;
  min-height: 100%;
  object-fit: cover;
  border-radius: 15px;
}


.info-container {
  width: 50%;
  padding: 2rem;
  background: var(--q-secondary);
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 15px;
}

.info-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.image-title {
  font-size: 1.2rem;
}

.image-description {
  margin-top: 20px;
  font-size: 1.2rem;
}

.image-date {
  font-size: 1.2rem;
  color: gray;
}

.buttons {
  display: flex;
  justify-content: space-around;
  margin-top: 2rem;
}

.edit-btn {
  padding: 10px 20px;
}

.delete-btn {
  padding: 10px 20px;
}
</style>
