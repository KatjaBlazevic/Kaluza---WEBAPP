<template>
  <q-page class="onama-page">
    <div class="hero-section flex flex-center">
      <div class="hero-content text-center">
        <h1 class="hero-title">Upoznaj Pets&Care</h1>
        <p class="hero-subtitle">
          Strastveno gradimo zajednicu za ljubimce i njihove vlasnike
        </p>
      </div>
    </div>

    <!-- Sekcija 1 - Misija -->
    <div class="section-container">
      <div class="section-content row items-center justify-between">
        <!-- Tekst - na mobilnom prvi -->
        <div class="col-12 col-md-6 order-2 order-md-1 text-right">
          <h2 class="section-title mobile-center">Naša misija</h2>
          <p class="section-text mobile-center">
            Pets&Care je nastao iz ljubavi prema životinjama i želje da olakšamo brigu o ljubimcima.
            Naš cilj je pružiti pouzdane informacije, korisne alate i povezati vlasnike s veterinarima,
            događajima i uslugama u njihovoj blizini.
          </p>
        </div>
        <!-- Slika - na mobilnom druga -->
        <div class="col-12 col-md-5 order-1 order-md-2">
          <q-img
            src="~assets/misija.jpg"
            class="section-image"
            :ratio="16/9"
          />
        </div>
      </div>
    </div>

    <!-- Sekcija 2 - Tko smo mi -->
    <div class="section-container">
      <div class="section-content row items-center justify-between">
        <!-- Slika - na mobilnom druga -->
        <div class="col-12 col-md-5 order-1">
          <q-img
            src="~assets/tim-slika.jpg"
            class="section-image"
            :ratio="16/9"
          />
        </div>
        <!-- Tekst - na mobilnom prvi -->
        <div class="col-12 col-md-6 order-2 text-left">
          <h2 class="section-title mobile-center">Tko smo mi?</h2>
          <p class="section-text mobile-center">
            Pets&Care je zajednica koja povezuje ljubitelje životinja s ciljem stvaranja sigurnog, podržavajućeg i
            inspirativnog okruženja za vlasnike i njihove ljubimce.
            <br><br>
             Naša strast prema brizi o životinjama vodi nas u stvaranju prostora gdje svi mogu pronaći razumijevanje,
             dijeliti iskustva i osjećati se kao dio nečeg većeg. Uz nas, tvoji ljubimci dobivaju pažnju koju zaslužuju.
          </p>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
</script>

<style scoped>
.onama-page {
  background-color: white;
}

/* Hero sekcija */
.hero-section {
  height: 70vh;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1)), url('/hero_onama.png');
  background-size: cover;
  background-position: center;
  color: white;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  line-height: 1.5;
  margin-right: 20px;
  margin-left: 20px;
}

.hero-subtitle {
  font-size: 1.5rem;
  opacity: 0.9;
  margin-right: 20px;
  margin-left: 20px;
}

/* Sekcije */
.section-container {
  padding: 100px 8%;
  max-width: 1400px;
  margin: 0 auto;
}

.section-content {
  margin: 0 auto;
}

.section-title {
  font-size: 2.2rem;
  color: var(--q-primary);
  margin-bottom: 1.5rem;
  line-height: 1.3;
}

.section-text {
  font-size: 1.15rem;
  line-height: 1.7;
  color: var(--q-dark);
  margin-bottom: 1.5rem;
}

.section-image {
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  transition: transform 0.3s ease;
}

.section-image:hover {
  transform: scale(1.02);
}

.text-content {
  padding: 0 2rem;
}

/* Responzivnost */
@media (max-width: 1023px) {
  .hero-title {
    font-size: 2.4rem;
  }

  .hero-subtitle {
    font-size: 1.3rem;
    padding: 0 1rem;
  }

  .section-container {
    padding: 70px 6%;
  }

  .section-title {
    font-size: 1.8rem;
    margin-bottom: 1.2rem;
  }

  .section-text {
    font-size: 1.05rem;
  }

  .text-content {
    padding: 1rem 0;
  }
}

@media (max-width: 600px) {
  .mobile-center {
    text-align: center !important;
  }

  .order-1 {
    order: 2; /* Slika ide ispod teksta */
    margin-top: 20px;
  }

  .order-2 {
    order: 1; /* Tekst ide iznad slike */
  }

  .section-image {
    margin: 0 auto;
  }
}
</style>
