// stores/user.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    state: () => ({
        id: null,
        ime: '',
        prezime: '',
        role: '',
        token: null, // JWT token
    }),

    getters: {
        userFullName: (state) => {
            if (state.role === 'admin') {
                return state.ime;
            }
            return `${state.ime || ''} ${state.prezime || ''}`.trim();
        },
        isAuthenticated: (state) => !!state.token,
        getUserId: (state) => state.id,
        getUserRole: (state) => state.role,
    },

    actions: {
        setUser(userData) {
            console.log('Pinia Store: setUser called with:', userData); // Dodani log
            this.$patch({
                id: userData.id || null,
                ime: userData.ime || '',
                prezime: userData.prezime || '',
                role: userData.role || '',
                token: userData.token || null,
            });

            if (userData.token) {
                localStorage.setItem('token', userData.token);
                // Ovdje spremamo i userData objekt, ako ga ne vraćamo iz tokena
                // Ranije si imala i localStorage.setItem('userData', JSON.stringify({ ... }));
                // ako ga koristiš u nekom dijelu appa, vrati ga.
                // Trenutno se oslanjamo na to da initializeUser dekodira token.
            }
        },

        async initializeUser() {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const parts = storedToken.split('.');
                    if (parts.length !== 3) {
                        console.warn('Pinia Store - Initialize: Invalid JWT format in localStorage.');
                        this.clearUser();
                        return false;
                    }
                    const decodedToken = JSON.parse(atob(parts[1]));

                    console.log('Pinia Store - Initialize: Decoded token payload:', decodedToken); // Debug log
                    console.log('Pinia Store - Initialize: Role from decoded token:', decodedToken.role); // Debug log

                    const currentTime = Date.now() / 1000;
                    if (decodedToken.exp < currentTime) {
                        console.warn('Pinia Store - Initialize: JWT token expired. Clearing user data.');
                        this.clearUser();
                        return false;
                    }

                    // ✅ KLJUČNA PROMJENA: Postavi stanje direktno OVDJE,
                    // prije nego što se bilo koji getter pokuša koristiti
                    // i proslijedi token.
                    this.$patch({
                        id: decodedToken.id || null,
                        ime: decodedToken.ime || '',
                        prezime: decodedToken.prezime || '',
                        role: decodedToken.role || '',
                        token: storedToken // KLJUČNO: Dodaj token ovdje
                    });

                    console.log('Pinia Store - Initialize: ✅ User successfully initialized from token. Current role:', this.role); // Debug log
                    return true;

                } catch (e) {
                    console.error('❌ Pinia Store - Initialize: Error during user initialization from token:', e);
                    this.clearUser();
                    return false;
                }
            }
            this.clearUser();
            console.log('Pinia Store - Initialize: No token found in localStorage. Store initialized as logged out.');
            return false;
        },

        clearUser() {
            console.log('Pinia Store: clearUser called.'); // Debug log
            this.$patch({
                id: null,
                ime: '',
                prezime: '',
                role: '',
                token: null,
            });
            localStorage.removeItem('token');
            // Ako si prije koristila i userData u localStorage, vrati:
            // localStorage.removeItem('userData');
            console.log('Pinia Store: ✅ User logged out and data cleared from store and localStorage.');
        }
    }
});
