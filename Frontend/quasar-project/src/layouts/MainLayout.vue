  <template>
    <q-layout view="lHh Lpr lFf">
      <!-- Custom Header bez hamburger ikone -->
      <AppHeader />

      <!-- Glavni sadržaj -->
      <q-page-container>
        <router-view />
      </q-page-container>

      <!-- Smanjeni Footer -->
      <AppFooter class="mini-footer" />
    </q-layout>
  </template>

  <script setup>
  import AppHeader from 'components/AppHeader.vue'
  import AppFooter from 'components/AppFooter.vue'

  defineOptions({
    name: 'MainLayout'
  })
  </script>

  <style scoped>
  /* Stil za smanjeni footer */
  .mini-footer {
    min-height: 40px !important;
    padding: 8px 0 !important;
  }
  </style>
