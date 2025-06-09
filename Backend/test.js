const request = require('supertest');
const { app, closeServer } = require('./server');

describe('POST /prijava', () => {
  test('treba uspješno prijaviti korisnika s ispravnim podacima', async () => {
    const response = await request(app)
      .post('/prijava')
      .send({
        username: 'katjablaz55@gmail.com',  // ili nadimak korisnika iz baze
        lozinka: 'katja123'
      })
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Uspješna prijava');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('email', 'katjablaz55@gmail.com');

  });

  test('treba vratiti grešku za neispravne podatke', async () => {
    const response = await request(app)
      .post('/prijava')
      .send({
        username: 'pogresan@example.com',
        lozinka: 'kriva_lozinka'
      })
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('message', 'Neispravan email/nadimak ili lozinka.');
  });

  afterAll(async () => {
    await closeServer();
  });
});
