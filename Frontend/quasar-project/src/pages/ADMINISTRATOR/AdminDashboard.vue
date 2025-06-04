<template>
  <q-page class="dashboard-page">
    <div class="q-pa-md">
      <h1>Administratorski Dashboard</h1>

      <div class="row q-gutter-md">
        <q-card class="stat-card col-xs-12 col-sm-6 col-md-4">
          <q-card-section>
            <h3>Ukupno korisnika</h3>
            <p class="text-h5">{{ stats.korisnici }}</p>
          </q-card-section>
        </q-card>

        <q-card class="stat-card col-xs-12 col-sm-6 col-md-4">
          <q-card-section>
            <h3>Ukupno veterinara</h3>
            <p class="text-h5">{{ stats.veterinari }}</p>
          </q-card-section>
        </q-card>

        <q-card class="stat-card col-xs-12 col-sm-6 col-md-4">
          <q-card-section>
            <h3>Ukupno događaja</h3>
            <p class="text-h5">{{ stats.dogadaji }}</p>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";

const stats = ref({ korisnici: 0, veterinari: 0, dogadaji: 0 });

async function fetchStats() {
  try {
    const res = await fetch("http://localhost:3000/admin/stats", { method: "GET", credentials: "include" });

    if (!res.ok) {
      throw new Error("❌ Greška pri dohvaćanju statistike.");
    }

    stats.value = await res.json();
  } catch (err) {
    console.error("❌ Greška pri dohvaćanju statistike:", err);
  }
}

onMounted(fetchStats);
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  padding-top: 40px;
}

h1 {
  font-size: 28px;
  font-weight: bold;
  color: var(--q-primary);
  text-align: center;
  margin-bottom: 24px;
}

.stat-card {
  width: 100%;
  max-width: 320px;
  text-align: center;
  background-color: #f5f5f5;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  font-weight: bold;
  color: var(--q-dark);
  margin-bottom: 8px;
}

.stat-card p {
  font-size: 28px;
  font-weight: bold;
  color: var(--q-accent);
}
</style>

