import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userFullName: '',
    ime: '',
    prezime: '',
    SIFRA_KORISNIKA: null,
    SIFRA_VETERINARA: null // Dodano za veterinara
  }),
  actions: {
    setUser(data) {
      this.$patch({
        ime: data.ime || '',
        prezime: data.prezime || '',
        userFullName: `${data.ime || ''} ${data.prezime || ''}`.trim(),
        SIFRA_KORISNIKA: data.SIFRA_KORISNIKA || null,
        SIFRA_VETERINARA: data.SIFRA_VETERINARA || null // Spremi veterinara ako postoji
      });
    },
    clearUser() {
      this.$patch({
        ime: '',
        prezime: '',
        userFullName: '',
        SIFRA_KORISNIKA: null,
        SIFRA_VETERINARA: null
      });
    }
  }
});
