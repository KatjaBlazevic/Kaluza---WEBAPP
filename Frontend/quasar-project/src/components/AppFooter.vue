<template>
  <q-footer elevated class="bg-primary text-white compact-footer">
    <div class="row q-px-md q-py-sm"> <!-- Uniformni padding lijevo/desno -->
      <!-- Logo i opis (lijevo) -->
      <div class="col-12 col-md-4">
        <div class="text-subtitle2 q-mb-xs">Tu ide logo</div>
        <div class="text-footer">Sve što ti i tvoj ljubimac trebate, na jednom mjestu.</div>
      </div>

      <!-- Navigacija (centrirano) -->
      <div class="col-12 col-md-4 q-mt-sm q-mt-md-none text-center"> <!-- Dodan text-center -->
        <div class="text-subtitle2 q-mb-xs">Navigacija</div>
        <div v-for="link in links" :key="link.text">
          <q-btn flat dense :label="link.text" :to="link.to" class="text-footer" />
        </div>
      </div>

      <!-- Društvene mreže (desno) -->
      <div class="col-12 col-md-4 q-mt-sm q-mt-md-none text-right"> <!-- Dodan text-right -->
        <div class="text-subtitle2 q-mb-xs">Društvene mreže</div>
        <div class="text-footer">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </div>
      </div>
    </div>

    <!-- Copyright -->
    <div class="row justify-center q-py-xs bg-dark">
      <div class="text-footer">
        © {{ new Date().getFullYear() }} Pets&Care - Sva prava pridržana
      </div>
    </div>
  </q-footer>
</template>

<script>
export default {
  data() {
    return {
      links: [
        { text: 'Početna', to: '/' },
        { text: 'O nama', to: '/about' },
        { text: 'Događaji', to: '/events' },
        { text: 'Veterinari', to: '/vets' },
        { text: 'Kontakt', to: '/contact' }
      ]
    }
  }
}
</script>

<style scoped>
.compact-footer {
  padding: 10px 0 !important;
}

.text-footer {
  font-size: 10px !important;
  line-height: 1 !important;
}

.text-subtitle2 {
  font-size: 14px !important;
  margin-bottom: 4px !important;
}

.col-md-4 {
  padding-left: 200px !important;
  padding-right: 200px !important;

}
</style>
