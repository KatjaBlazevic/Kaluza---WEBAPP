<template>
  <q-page class="gallery-page">
    <div class="hero-section flex flex-center">
      <div class="hero-content text-center text-white">
        <h1 class="hero-title">Galerija mojih ljubimaca</h1>
        <q-btn unelevated label="DODAJ SLIKU" color="white" text-color="dark" size="lg" class="add-image-btn q-mt-md" to="/dodaj-sliku"/>
      </div>
    </div>

    <div class="main-content">
      <div v-if="galleryImages.length > 0">
        <div class="gallery-section">
          <div class="row justify-center q-gutter-xl">
            <div v-for="image in (showAll ? galleryImages : galleryImages.slice(0, 3))"
                 :key="image.SIFRA_SLIKE"
                 class="image-card"
                 @click="openImagePage(image)">
              <q-img :src="image.slika" alt="Slika ljubimca" class="gallery-img" />
              <q-card-section class="text-center">
                <h3 class="image-title">{{ image.naziv_slike }}</h3>
                <p class="image-date">{{ image.datum_objave }}</p>
              </q-card-section>
            </div>
          </div>
        </div>

        <div class="text-center q-mt-md">
          <q-btn v-if="galleryImages.length > 3" @click="showAll = !showAll" :label="showAll ? 'Prikaži manje' : 'Prikaži više'" color="primary" />
        </div>
      </div>
      <div v-else class="text-center q-mt-xl">
        <p class="text-h6 text-dark">Galerija je trenutno prazna.</p>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user'; // Dodano za pristup userStore-u

const galleryImages = ref([]);
const showAll = ref(false);
const router = useRouter();
const userStore = useUserStore(); // Inicijalizacija userStore-a

async function fetchGallery() {
  // Dohvati JWT token iz localStorage-a
  const token = localStorage.getItem('token');

  // Ako token ne postoji, preusmjeri na prijavu
  if (!token) {
    router.push('/prijava');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/galerija', {
      method: 'GET',
      // Pošalji token u Authorization headeru
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Ako odgovor nije OK (npr. 401 Unauthorized, 403 Forbidden)
    if (res.status === 401 || res.status === 403) {
      // Obriši nevažeći token i podatke korisnika
      localStorage.removeItem('token');
      userStore.clearUser();
      // Preusmjeri na stranicu za prijavu
      router.push('/prijava');
      return;
    }

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.poruka || 'Greška pri dohvaćanju galerije.');
    }

    galleryImages.value = await res.json();
  } catch (err) {
    console.error('Greška pri dohvaćanju slika:', err);
    // Opcionalno: Prikazati poruku korisniku da je došlo do greške
  }
}

const openImagePage = (image) => {
  router.push({ name: 'SlikaPage', params: { SIFRA_SLIKE: image.SIFRA_SLIKE } });
};

onMounted(fetchGallery);
</script>

<style scoped>
.gallery-page {
  background-color: white;
}

.hero-section {
  height: 70vh;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1)), url('/hero_dogadaji.jpg');
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

.add-image-btn {
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

.gallery-section {
  background: var(--q-secondary);
  border-radius: 15px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.image-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  width: 300px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.image-title {
  font-size: 1.2rem;
  font-weight: bold;
  line-height: 1.7;
  color: var(--q-dark);
}

.image-date {
  font-size: 0.9em;
  color: gray;
}

.gallery-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
}

/* Responsivni stilovi */
@media (max-width: 1023px) {
  .hero-title {
    font-size: 2rem;
  }

  .main-content {
    padding: 60px 5%;
  }

  .gallery-section {
    padding: 30px;
  }

  .image-card {
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

  .gallery-section {
    padding: 20px;
  }
}
</style>
