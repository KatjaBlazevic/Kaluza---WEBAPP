const request = require('supertest');
const { app, db, closeServer } = require('../../server'); 

describe('API Test: Dohvaćanje veterinara', () => {
  
  // TEST: Treba uspješno dohvatiti popis veterinara
  test('Treba dohvatiti sve veterinare iz baze', async () => {
    const response = await request(app)
      .get('/veterinari')
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    console.log('✔ Dohvaćeni veterinari:', response.body);
  });

  // TEST: Simulacija greške u bazi
test('Treba vratiti 500 ako baza prijavi grešku', async () => {
  jest.spyOn(db, 'query').mockImplementation((_, callback) => {
    callback(new Error('Greška u bazi'), null);
  });

  const response = await request(app)
    .get('/veterinari')
    .set('Accept', 'application/json');

  expect(response.statusCode).toBe(500);
  expect(response.body).toHaveProperty('poruka'); 
  expect(response.body.poruka).toMatch(/greška/i); // Omogućava fleksibilnije očekivanje

  console.log('❌ Simulirana greška u bazi:', response.body);
});


  // TEST: Provjera da baza vrati prazan niz ako nema podataka
  test('Treba vratiti prazan niz ako nema veterinara u bazi', async () => {
    // Mockiranje baze da vraća prazan niz
    jest.spyOn(db, 'query').mockImplementation((_, callback) => {
      callback(null, []);
    });

    const response = await request(app)
      .get('/veterinari')
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);

    console.log('✔ Nema dostupnih veterinara u bazi.');
  });
afterAll(() => {
  db.end(); // ✅ Zatvara konekciju s bazom kako bi Jest mogao normalno završiti
  closeServer(); // ✅ Ako server koristi `listen()`, zatvori ga
});

});
