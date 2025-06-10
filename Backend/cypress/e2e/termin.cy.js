describe("Zakazivanje termina kod veterinara", () => {
  const baseUrl = "http://localhost:3000";
 
  const userCredentials = {
    username: "ana90",
    lozinka: "lozinka123",
  };
 
  it("Korisnik se prijavljuje i zakazuje termin", () => {
    // 1. Prijava korisnika
    cy.request("POST", `${baseUrl}/prijava`, userCredentials).then(
      (loginRes) => {
        expect(loginRes.status).to.eq(200);
        const token = loginRes.body.token;
 
        // 2. Podaci o terminu
        const noviTermin = {
          datum_termina: "2025-06-25",
          vrijeme_termina: "10:30",
          simptomi_ljubimca: "Kašalj i gubitak apetita",
          razlog_posjete: "Pregled zbog mogućeg prehlade",
          SIFRA_LJUBIMCA: 1,
          SIFRA_VETERINARA: 5,
        };
 
        // 3. Slanje zahtjeva za zakazivanje
        cy.request({
          method: "POST",
          url: `${baseUrl}/zakazi-termin`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: noviTermin,
        }).then((res) => {
          expect(res.status).to.eq(201);
          expect(res.body.poruka).to.eq("✅ Termin uspješno zakazan.");
        });
      }
    );
  });
});