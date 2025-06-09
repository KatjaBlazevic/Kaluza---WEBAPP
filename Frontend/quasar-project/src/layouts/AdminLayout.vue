<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Custom Header za administratora -->
    <AdminHeader />

    <!-- Glavni sadržaj -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import AdminHeader from 'components/AdminHeader.vue'

defineOptions({
  name: 'AdminLayout'
})
</script>

<style scoped>
/* Stil za smanjeni footer */
.mini-footer {
  min-height: 40px !important;
  padding: 8px 0 !important;
}
</style>
