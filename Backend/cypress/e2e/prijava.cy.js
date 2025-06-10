describe("Prijava korisnika - acceptance testovi", () => {
  const baseUrl = "http://localhost:3000"; // Promijeni ako ti backend koristi drugi port
 
  const validCredentials = {
    username: "ana90",
    lozinka: "lozinka123",
  };
 
  const invalidCredentials = {
    username: "ana90",
    lozinka: "pogresnaLozinka",
  };
 
  it("✅ Uspješna prijava korisnika", () => {
    cy.request("POST", `${baseUrl}/prijava`, validCredentials).then(
      (response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("token");
        expect(response.body.user).to.include.keys(
          "id",
          "ime",
          "prezime",
          "role"
        );
 
        const token = response.body.token;
 
        // ✔ Provjera sesije preko tokena
        cy.request({
          method: "GET",
          url: `${baseUrl}/api/check-session`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.authenticated).to.be.true;
          expect(res.body.user).to.include.keys("id", "ime", "prezime");
        });
 
        // ✔ Dohvat profila
        cy.request({
          method: "GET",
          url: `${baseUrl}/profile`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body).to.include.keys("id", "ime", "prezime", "role");
        });
      }
    );
  });
 
  it("Neuspješna prijava s pogrešnom lozinkom", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/prijava`,
      failOnStatusCode: false,
      body: invalidCredentials,
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body.message).to.eq("Neispravan email/nadimak ili lozinka.");
    });
  });
 
  it("Prijava bez podataka vraća 400", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/prijava`,
      failOnStatusCode: false,
      body: {},
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq("Email/nadimak i lozinka su obavezni.");
    });
  });
});