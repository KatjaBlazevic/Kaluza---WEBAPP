import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userFullName: '',
    ime: '',
    prezime: '',
    SIFRA_KORISNIKA: null
  }),
  actions: {
    setUser(data) {
      this.$patch({
        ime: data.ime || '',
        prezime: data.prezime || '',
        SIFRA_KORISNIKA: data.SIFRA_KORISNIKA || null,
        userFullName: `${data.ime || ''} ${data.prezime || ''}`.trim()
      });
    },
    clearUser() {
      this.$patch({
        ime: '',
        prezime: '',
        SIFRA_KORISNIKA: null,
        userFullName: ''
      });
    }
  }
});
