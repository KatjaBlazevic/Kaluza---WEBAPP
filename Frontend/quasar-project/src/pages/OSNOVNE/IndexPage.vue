<template>
  <q-page class="index-page">
    <div class="hero-section flex flex-center">
      <div class="hero-content text-center text-white">
        <h1 class="hero-title">Briga za tvoje ljubimce na jednom mjestu</h1>
        <q-btn
          unelevated
          label="PRONAĐI VETERINARA"
          color="white"
          text-color="dark"
          size="lg"
          class="find-vet-btn q-mt-md"
          to="/vets"
        />
      </div>
    </div>

    <div class="main-content">
      <div class="row justify-center q-gutter-xl q-mb-xl">
        <div class="info-card" data-testid="about-card"> <q-icon name="pets" size="lg" class="section-icon" />
          <h2 class="text-h5 q-mt-sm q-mb-sm text-dark">O NAMA</h2>
          <p class="q-mb-md text-dark">
            Saznajte više o nama<br>
            i našoj misiji.
          </p>
          <q-btn
            unelevated
            label="Saznaj više"
            color="white"
            text-color="dark"
            to="/about"
            class="full-width card-btn"
          />
        </div>

        <div class="info-card" data-testid="join-card"> <q-icon name="group_add" size="lg" class="section-icon" />
          <h2 class="text-h5 q-mt-sm q-mb-sm text-dark">PRIDRUŽI SE</h2>
          <p class="q-mb-md text-dark">
            Registrirajte se i <br>
            pridružite našoj zajednici!
          </p>
          <q-btn
            unelevated
            label="REGISTRIRAJ SE"
            color="white"
            text-color="dark"
            to="/register"
            class="full-width card-btn"
          />
        </div>

        <div class="info-card" data-testid="events-card"> <q-icon name="event" size="lg" class="section-icon" />
          <h2 class="text-h5 q-mt-sm q-mb-sm text-dark">DOGADAJI</h2>
          <p class="q-mb-md text-dark">
            Otkrijte nadolazeće<br>
            događaje i okupljanja.
          </p>
          <q-btn
            unelevated
            label="POGLEDAJ"
            color="white"
            text-color="dark"
            to="/events"
            class="full-width card-btn"
          />
        </div>
      </div>

      <div class="text-center q-mt-xl">
        <q-btn
          unelevated
          label="TRAŽIŠ ČUVALICU ZA SVOG LJUBIMCA?"
          color="accent"
          size="md"
          href="https://www.siterice.hr"
          target="_blank"
          class="action-btn"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
</script>

<style scoped>
.index-page {
  background-color: white;
}

.hero-section {
  height: 70vh;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1)),url('/hero_pocetna.avif');
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
  line-height: 1.7;
  margin-right: 20px;
  margin-left: 20px;
}

.find-vet-btn {
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

.info-card {
  background: var(--q-secondary);
  border-radius: 15px;
  padding: 30px;
  width: 300px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  text-align: center;
}

.text-dark {
  color: var(--q-dark) !important;
}

.section-icon {
  color: var(--q-dark) !important;
}

.card-btn {
  border-radius: 10px !important;
  font-weight: bold;
}

.action-btn {
  border-radius: 15px;
  padding: 10px 30px;
  font-weight: bold;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

/* Responsivni stilovi */
@media (max-width: 1023px) {
  .hero-title {
    font-size: 2rem;
  }

  .main-content {
    padding: 60px 5%;
  }

  .info-card {
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

  .action-btn {
    width: 100%;
  }
}
</style>
