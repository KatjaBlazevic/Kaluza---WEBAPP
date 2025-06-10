const request = require('supertest');
const { app,db, closeServer } = require('../../server');
const jwt = require('jsonwebtoken');

// Funkcija za odjavu korisnika
async function logoutUser() {
  const response = await request(app)
    .post('/logout') 
    .set('Accept', 'application/json');
}

// PRIJAVA KORISNIKA
test('Treba uspješno prijaviti korisnika i vratiti JWT token', async () => {
  const response = await request(app)
    .post('/prijava')
    .send({
      username: 'ana90',
      lozinka: 'lozinka123'
    })
    .set('Accept', 'application/json');

  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty('token');

  const token = response.body.token;
  console.log("Dekodirani JWT Token za korisnika:", jwt.decode(token));

  const decoded = jwt.verify(token, 'tajni_kljuc_za_jwt');
  expect(decoded).toHaveProperty('role', 'korisnik');

  await logoutUser(); 
});

// PRIJAVA ADMINISTRATORA
test('Treba uspješno prijaviti administratora', async () => {
  const response = await request(app)
    .post('/prijava')
    .send({
      username: 'kacha',
      lozinka: 'admin1'
    })
    .set('Accept', 'application/json');

  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty('token'); 

  const token = response.body.token;
  console.log("Dekodirani JWT Token za administratora:", jwt.decode(token));

  const decoded = jwt.verify(token, 'tajni_kljuc_za_jwt');
  expect(decoded).toHaveProperty('role', 'admin'); 

  await logoutUser(); 
});

// PRIJAVA VETERINARA 
test('Treba uspješno prijaviti veterinara', async () => {
  const response = await request(app)
    .post('/prijava')
    .send({
      username: 'ivan.horvat@vet.com',
      lozinka: 'lozinka123'
    })
    .set('Accept', 'application/json');

  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty('token');

  const token = response.body.token;
  console.log("Dekodirani JWT Token za veterinara:", jwt.decode(token));

  const decoded = jwt.verify(token, 'tajni_kljuc_za_jwt');
  expect(decoded).toHaveProperty('role', 'veterinar');

  await logoutUser();
});

afterAll(() => {
  closeServer(); 
  db.end(); 
});
