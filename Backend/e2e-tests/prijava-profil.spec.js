const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000'; // Provjeri pravi port backend servera

test.describe('End-to-End Test: Prijava + Profil', () => {
  
  test('Treba uspješno prijaviti korisnika i dohvatiti profil', async ({ request }) => {
    // 🔹 1. Prijava korisnika
    const loginResponse = await request.post(`${BASE_URL}/prijava`, {
      data: {
        username: 'ana90',
        lozinka: 'lozinka123'
      }
    });

    expect(loginResponse.status()).toBe(200);
    const loginData = await loginResponse.json();
    expect(loginData).toHaveProperty('token'); 
    expect(loginData.user.role).toBe('korisnik');

    console.log('✔ JWT Token za korisnika:', loginData.token);

    // 🔹 2. Dohvaćanje korisničkog profila s tokenom
    const profileResponse = await request.get(`${BASE_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${loginData.token}` // Slanje tokena u zahtjevu
      }
    });

    expect(profileResponse.status()).toBe(200);
    const profileData = await profileResponse.json();
    expect(profileData).toHaveProperty('id', loginData.user.id);
    expect(profileData).toHaveProperty('ime', loginData.user.ime);
    expect(profileData).toHaveProperty('prezime', loginData.user.prezime);
    expect(profileData).toHaveProperty('role', loginData.user.role);

    console.log('✔ Dohvaćen korisnički profil:', profileData);
  });

test('Neuspješno dohvaćanje profila bez tokena', async ({ request }) => {
    const profileResponse = await request.get(`${BASE_URL}/profile`);

    expect(profileResponse.status()).toBe(401);

    const profileData = await profileResponse.json();
    expect(profileData).toHaveProperty('poruka'); // 🔹 API vraća "poruka", ne "message"
    expect(profileData.poruka).toBe('Autentifikacija potrebna. Nedostaje token.');

    console.log('❌ Pokušaj dohvaćanja profila bez tokena:', profileData.poruka);
});

});
