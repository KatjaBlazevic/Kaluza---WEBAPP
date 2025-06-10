const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000'; // Zamijeni s pravim portom ako backend koristi drugi

test.describe('End-to-End Test: Prijava', () => {
  
  test('Treba uspješno prijaviti korisnika', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/prijava`, {
      data: {
        username: 'ana90',
        lozinka: 'lozinka123'
      }
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('token'); 
    expect(responseBody.user.role).toBe('korisnik');

    console.log('✔ JWT Token za korisnika:', responseBody.token);
  });

  test('Treba uspješno prijaviti administratora', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/prijava`, {
      data: {
        username: 'kacha',
        lozinka: 'admin1'
      }
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('token'); 
    expect(responseBody.user.role).toBe('admin');

    console.log('✔ JWT Token za administratora:', responseBody.token);
  });

  test('Treba uspješno prijaviti veterinara', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/prijava`, {
      data: {
        username: 'ivan.horvat@vet.com',
        lozinka: 'lozinka123'
      }
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('token'); 
    expect(responseBody.user.role).toBe('veterinar');

    console.log('✔ JWT Token za veterinara:', responseBody.token);
  });

  test('Neispravna prijava - krivi podaci', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/prijava`, {
      data: {
        username: 'pogresniUser',
        lozinka: 'krivaLozinka'
      }
    });

    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expect(responseBody.message).toBe('Neispravan email/nadimak ili lozinka.');
    
    console.log('❌ Neuspješna prijava:', responseBody.message);
  });

});
