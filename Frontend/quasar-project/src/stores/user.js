import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    userFullName: '',
    ime: '',
    prezime: '',
    SIFRA_KORISNIKA: null,
    SIFRA_VETERINARA: null, // ✅ Veterinar ostaje
    SIFRA_ADMINISTRATORA: null // ✅ Dodano za administratora
  }),
  actions: {
    setUser(data) {
      this.$patch({
        ime: data.ime || '',
        prezime: data.prezime || '',
        userFullName: `${data.ime || ''} ${data.prezime || ''}`.trim(),
        SIFRA_KORISNIKA: data.SIFRA_KORISNIKA || null,
        SIFRA_VETERINARA: data.SIFRA_VETERINARA || null, // ✅ Veterinar ostaje
        SIFRA_ADMINISTRATORA: data.SIFRA_ADMINISTRATORA || null // ✅ Spremi administratora ako postoji
      });
    },
    clearUser() {
      this.$patch({
        ime: '',
        prezime: '',
        userFullName: '',
        SIFRA_KORISNIKA: null,
        SIFRA_VETERINARA: null,
        SIFRA_ADMINISTRATORA: null
      });
    }
  }
});
