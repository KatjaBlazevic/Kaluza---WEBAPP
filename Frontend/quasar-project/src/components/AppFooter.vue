<template>
  <q-footer
    elevated
    class="bg-primary text-white footer"
    :class="{ 'footer-visible': isFooterVisible }"
  >
    <div class="footer-content">
      <div class="row gt-sm items-center justify-between q-px-xl q-py-md">
        <div class="col-3">
          <div class="text-subtitle2 q-mb-xs">Pets&Care</div>
          <div class="text-caption">Sve za vašeg ljubimca na jednom mjestu</div>
        </div>

        <div class="col-6 text-center">
          <div class="text-subtitle2 q-mb-xs">Navigacija</div>
          <div class="row justify-center q-gutter-sm">
            <q-btn
              v-for="link in links"
              :key="link.text"
              flat
              dense
              :label="link.text"
              :to="link.to"
              class="text-caption"
            />
          </div>
        </div>

        <div class="col-3 text-right">
          <div class="text-subtitle2 q-mb-xs">Pratite nas</div>
          <div class="row justify-end q-gutter-xs">
            <q-btn
              round
              dense
              icon="facebook"
              size="sm"
              href="https://www.facebook.com/share/1AUL2LnL3D/?mibextid=wwXIfr"
              target="_blank"
            />
          </div>
        </div>
      </div>

      <div class="column lt-md items-center q-pa-md">
        <div class="text-subtitle2 q-mb-sm">Navigacija</div>
        <div class="row q-gutter-sm q-mb-sm">
          <q-btn
            v-for="link in mobileLinks"
            :key="link.text"
            flat
            dense
            :label="link.text"
            :to="link.to"
            size="sm"
          />
        </div>
        <div class="text-subtitle2 q-mb-xs">Pratite nas</div>
        <div class="row q-gutter-sm q-mb-md">
          <q-btn
            round
            dense
            icon="facebook"
            size="sm"
            href="https://www.facebook.com/share/1AUL2LnL3D/?mibextid=wwXIfr"
            target="_blank"
          />
        </div>
        <div class="text-caption text-center">
          © {{ new Date().getFullYear() }} Pets&Care
        </div>
      </div>
    </div>
  </q-footer>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isFooterVisible = ref(false);

const links = [
  { text: 'Početna', to: '/' },
  { text: 'O nama', to: '/about' },
  { text: 'Događaji', to: '/events' },
  { text: 'Veterinari', to: '/vets' },
  { text: 'Kontakt', to: '/contact' }
];

const mobileLinks = [
  { text: 'Početna', to: '/' },
  { text: 'O nama', to: '/about' },
  { text: 'Kontakt', to: '/contact' }
];

const checkScroll = () => {
  const scrollPosition = window.innerHeight + window.scrollY;
  const documentHeight = document.body.offsetHeight;
  isFooterVisible.value = scrollPosition >= documentHeight - 50;
};

onMounted(() => {
  window.addEventListener('scroll', checkScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll);
});
</script>

<style scoped>
.footer-content {
  max-width: 1400px;
  margin: 0 auto;
}

.footer {
  position: fixed;
  bottom: -100%;
  left: 0;
  right: 0;
  transition: bottom 0.3s ease;
}

.footer-visible {
  bottom: 0;
}

/* Desktop stilovi */
.q-px-xl {
  padding-left: 40px;
  padding-right: 40px;
}

/* Mobilni stilovi */
@media (max-width: 1023px) {
  .q-pa-md {
    padding: 16px;
  }
}

/* Općeniti stilovi */
.text-subtitle2 {
  font-size: 14px;
  font-weight: 500;
}

.text-caption {
  font-size: 12px;
}
</style>
