const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000'; 

test.describe('End-to-End Test: Ažuriranje profila', () => {
  
  test('Treba uspješno ažurirati profil korisnika', async ({ request }) => {
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

    // 🔹 2. Ažuriranje profila
    const updateResponse = await request.put(`${BASE_URL}/update-profile`, {
      headers: {
        Authorization: `Bearer ${loginData.token}`
      },
      data: {
        ime: 'Ana',
        prezime: 'Anić',
        email: 'nova.email@korisnik.com'
      }
    });

    expect(updateResponse.status()).toBe(200);
    const updatedData = await updateResponse.json();
    expect(updatedData).toHaveProperty('message', 'Profil uspješno ažuriran');

    console.log('✔ Ažurirani profil:', updatedData.user);
    console.log('✔ Novi JWT Token:', updatedData.token);
  });

  test('Neuspješno ažuriranje profila bez tokena', async ({ request }) => {
    const updateResponse = await request.put(`${BASE_URL}/update-profile`, {
      data: {
        ime: 'Ana',
        prezime: 'Anić',
        email: 'test@email.com'
      }
    });

    expect(updateResponse.status()).toBe(401);

    const updateData = await updateResponse.json();
    expect(updateData).toHaveProperty('poruka'); // API vraća "poruka", ne "error"
    expect(updateData.poruka).toBe('Autentifikacija potrebna. Nedostaje token.');

    console.log('❌ Pokušaj ažuriranja profila bez tokena:', updateData.poruka);
  });

});
