<template>
  <q-page class="slika-page">
    <q-card v-if="imageData" class="image-detail">
      <div class="content">
        <q-img :src="imageData.slika" class="detail-image" />

        <div class="info-container">
          <q-card-section>
            <div class="text-center">
              <p class="info-title text-dark"><strong>Naziv</strong></p>
              <h2 class="image-title">{{ imageData.naziv_slike }}</h2>
            </div>

            <div class="text-center q-mt-md"> <p class="info-title text-dark"><strong>Opis</strong></p>
              <p class="image-description">{{ imageData.opis_slike }}</p>
            </div>

            <div class="text-center q-mt-md"> <p class="info-title text-dark"><strong>Datum</strong></p>
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
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const imageData = ref(null);
const userStore = useUserStore();

const fetchImage = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/prijava');
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/slika/${route.params.SIFRA_SLIKE}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      userStore.clearUser();
      router.push('/prijava');
      return;
    }

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.poruka || 'Slika nije pronađena.');
    }

    imageData.value = await res.json();
  } catch (err) {
    console.error('Greška pri dohvaćanju slike:', err);
  }
};

const editImage = () => {
  router.push(`/slika/${route.params.SIFRA_SLIKE}/uredi`);
};

const deleteImage = async () => {
  if (!confirm('Jeste li sigurni da želite obrisati ovu sliku?')) {
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/prijava');
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/slika/${route.params.SIFRA_SLIKE}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      userStore.clearUser();
      router.push('/prijava');
      return;
    }

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.poruka || 'Neuspješno brisanje slike.');
    }

    console.log('🗑️ Slika uspješno obrisana!');
    router.push('/galerija');
  } catch (err) {
    console.error('Greška pri brisanju slike:', err);
    alert(err.message);
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
  padding: 20px; /* Dodan padding da se kartica ne lijepi za rubove */
  box-sizing: border-box; /* Uključi padding u širinu/visinu elementa */
}

.image-detail {
  display: flex;
  width: 100%; /* Postavi na 100% i dodaj max-width */
  max-width: 900px; /* Ograniči maksimalnu širinu kartice */
  background: white;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  border-radius: 15px;
  overflow: hidden;
  flex-direction: row; /* Osiguraj da su slika i info-container jedan pored drugog */
}

.content {
  display: flex;
  flex-grow: 1; /* Omogući contentu da se širi */
  /* Uklonjen max-height ovdje jer je ometao responzivnost */
  /* align-items: stretch; je već default za flex kontejnere ako nema druge visine */
}

.detail-image {
  width: 50%; /* Zadrži pola širine */
  min-height: 300px; /* Minimalna visina za sliku */
  height: auto; /* Podesi visinu automatski s obzirom na širinu */
  object-fit: cover;
  border-radius: 15px 0 0 15px; /* Samo lijevi rubovi */
}


.info-container {
  width: 50%; /* Zadrži pola širine */
  padding: 2rem;
  background: var(--q-secondary);
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 0 15px 15px 0; /* Samo desni rubovi */
}

.info-title {
  font-size: 1.5rem; /* Smanjeno s 2rem na 1.5rem */
  font-weight: bold;
  margin-bottom: 5px;
}

.image-title {
  font-size: 1.2rem;
  font-weight: bold; /* Dodano za naglašavanje naslova */
  color: var(--q-dark); /* Dodano radi bolje vidljivosti */
}

.image-description {
  margin-top: 10px; /* Smanjen razmak */
  font-size: 1rem; /* Smanjeno s 1.2rem na 1rem */
  line-height: 1.5; /* Poboljšana čitljivost */
  color: #555; /* Tamnija siva za bolji kontrast */
}

.image-date {
  font-size: 1rem; /* Smanjeno s 1.2rem na 1rem */
  color: gray;
}

.buttons {
  display: flex;
  justify-content: space-around;
  margin-top: 2rem;
  gap: 15px; /* Dodan razmak između gumba */
}

.edit-btn, .delete-btn {
  flex-grow: 1; /* Omogući gumbima da se šire */
  padding: 10px 20px;
  font-weight: bold; /* Naglašavanje teksta na gumbima */
}

/* Responsivni stilovi */
@media (max-width: 800px) {
  .image-detail {
    flex-direction: column; /* Na manjim ekranima složi vertikalno */
  }

  .detail-image, .info-container {
    width: 100%; /* Puna širina na manjim ekranima */
    border-radius: 15px; /* Vrati pune rubove */
  }

  .detail-image {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    max-height: 40vh; /* Ograniči visinu slike */
  }

  .info-container {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    padding: 1.5rem; /* Malo smanji padding */
  }

  .info-title {
    font-size: 1.2rem; /* Dodatno smanji veličinu naslova */
  }

  .image-title {
    font-size: 1rem;
  }

  .image-description, .image-date {
    font-size: 0.9rem;
  }

  .buttons {
    flex-direction: column; /* Složi gumbe vertikalno */
    align-items: stretch; /* Rastegni gumbe na punu širinu */
    gap: 10px; /* Smanji razmak između gumba */
  }
}

@media (max-width: 600px) {
  .slika-page {
    padding: 10px; /* Smanji padding na jako malim ekranima */
  }
  .info-container {
    padding: 1rem;
  }
}
</style>
