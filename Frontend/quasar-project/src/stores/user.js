import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userFullName: '',
    ime: '',
    prezime: '',
    SIFRA_KORISNIKA: null // Dodajemo SIFRA_KORISNIKA
  }),
  actions: {
    setUser(data) {
      this.ime = data.ime || ''
      this.prezime = data.prezime || ''
      this.SIFRA_KORISNIKA = data.SIFRA_KORISNIKA || null // Osiguravamo da bude spremljen
      this.userFullName = `${this.ime} ${this.prezime}`.trim()
    },
    clearUser() {
      this.ime = ''
      this.prezime = ''
      this.SIFRA_KORISNIKA = null // Resetiramo i ID korisnika
      this.userFullName = ''
    }
  }
});
