<template>
  <q-page class="dogadaji-page">
     <div class="hero-section flex flex-center">
      <div class="hero-content text-center">
        <h1 class="hero-title">Događaji za ljubimce</h1>
        <p class="hero-subtitle">
          Pronađite najbolje događaje za vas i vašeg ljubimca
        </p>
      </div>
    </div>

    <!-- Gornja sekcija s kalendarom i detaljima -->
    <div class="section-container q-px-xl">
      <div class="section-content row items-center justify-between">
        <!-- Lijeva kolona - Kalendar -->
        <div class="col-12 col-md-6 order-2 order-md-1">
          <div class="calendar-wrapper q-pa-md">
            <q-date
              v-model="selectedDate"
              :events="eventDates"
              event-color="secondary"
              color="primary"
              class="calendar"
              @update:model-value="onDateSelected"
            />
          </div>
        </div>

        <!-- Desna kolona - Detalji događaja -->
        <div class="col-12 col-md-6 order-1 order-md-2">
          <div class="event-details q-pa-md">
            <template v-if="selectedEvent">
              <h2 class="event-title">{{ selectedEvent.naziv_dogadaja }}</h2>
              <div class="event-info">
                <p><strong>Mjesto:</strong> {{ selectedEvent.grad }}, {{ selectedEvent.adresa }}</p>
                <p><strong>Opis:</strong> {{ selectedEvent.opis_dogadaja }}</p>
                <p><strong>Datum:</strong> {{ selectedEvent.datum }}</p>
                <p><strong>Vrijeme:</strong> {{ selectedEvent.vrijeme }}</p>
              </div>
            </template>
            <template v-else>
              <p class="no-event">Nema događaja za odabrani datum</p>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Donja sekcija - Mapa -->
    <div class="map-section q-px-xl">
      <div id="map" class="map"></div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const selectedDate = ref('');
const events = ref([]);
const eventDates = ref([]);
const selectedEvent = ref(null);
let map = null;
let marker = null;

const fetchEvents = async () => {
  try {
    const response = await fetch('http://localhost:3000/dogadaji');
    const data = await response.json();

    events.value = data.map(e => ({
      naziv_dogadaja: e.naziv_dogadaja,
      grad: e.grad,
      adresa: e.adresa,
      opis_dogadaja: e.opis_dogadaja,
      datum: e.datum_dogadaja,
      vrijeme: e.vrijeme_dogadaja,
      vrsta_dogadaja: e.vrsta_dogadaja
    }));

    eventDates.value = [...new Set(events.value.map(e => e.datum.replaceAll('-', '/')))];

    // Postavi današnji datum
    const today = new Date().toISOString().slice(0, 10).replaceAll('-', '/');
    selectedDate.value = today;

    // Ako postoji događaj za današnji dan, postavi ga
    const todayEvent = events.value.find(e => e.datum === today.replaceAll('/', '-'));
    selectedEvent.value = todayEvent || null;

    updateMap();
  } catch (err) {
    console.error('Greška pri dohvaćanju događaja:', err);
  }
};

const onDateSelected = (newDate) => {
  selectedDate.value = newDate;
  const convertedDate = newDate.replaceAll('/', '-');
  const found = events.value.find(ev => ev.datum === convertedDate);
  selectedEvent.value = found || null;
};

const initMap = () => {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 45.815, lng: 15.981 },
    zoom: 12,
  });

  updateMap();
};

const updateMap = () => {
  if (!selectedEvent.value || !map) return;

  const geocoder = new google.maps.Geocoder();
  const location = `${selectedEvent.value.adresa}, ${selectedEvent.value.grad}`;

  geocoder.geocode({ address: location }, (results, status) => {
    if (status === "OK") {
      const loc = results[0].geometry.location;
      map.setCenter(loc);
      if (marker) marker.setMap(null);
      marker = new google.maps.Marker({
        map,
        position: loc,
      });
    } else {
      console.error("Geocoding nije uspio:", status);
    }
  });
};

onMounted(async () => {
  await fetchEvents();

  if (window.google && window.google.maps) {
    initMap();
  } else {
    const script = document.createElement("script");
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCLvePuBOyBwYrwdeUGkY4pQSzsWcFcRs4';
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    document.head.appendChild(script);
  }
});

watch(selectedEvent, updateMap);
</script>

<style scoped>
.dogadaji-page {
  background-color: white;
}

/* Hero sekcija */
.hero-section {
  height: 70vh;
   background: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8)), url('hero_dogadaji.jpg');
  background-size: cover;
  background-position: center;
  color: white;
  display: flex;
  margin-bottom: 2rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.hero-subtitle {
  font-size: 1.5rem;
  opacity: 0.9;
  max-width: 800px;
  margin: 0 auto;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section-content {
  margin-bottom: 3rem;
}

.calendar-wrapper {
  background: white;
  border-radius: 0.5rem;
}

.calendar {
  width: 100%;
}

.event-details {
  background: white;
  border-radius: 0.5rem;
  height: 100%;
  padding: 1.5rem;
  text-align: center;
}

.event-title {
  font-size: 1.5rem;
  color: var(--q-primary);
  margin-bottom: 1rem;
}

.event-info p {
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

.no-event {
  color: #666;
  font-style: italic;
}

.map-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  margin-bottom: 2rem;
}

.map {
  height: 15rem;
  width: 100%;
  border-radius: 0.5rem;
}

/* Responzivnost */
@media (max-width: 1023px) {
  .section-content {
    flex-direction: column;
  }

  .calendar-wrapper,
  .event-details {
    width: 100%;
    margin-bottom: 1.5rem;
  }

  .map {
    height: 20rem;
  }
}


@media (max-width: 600px) {
   .hero-title {
    font-size: 2.4rem;
  }

  .hero-subtitle {
    font-size: 1.3rem;
    padding: 0 1rem;
  }

  .section-container,
  .map-section {
    padding: 0 1rem;
  }

  .event-title {
    font-size: 1.3rem;
  }

  .map {
    height: 15rem;
  }
}
</style>
