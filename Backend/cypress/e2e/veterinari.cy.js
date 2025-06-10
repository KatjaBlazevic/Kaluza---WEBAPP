describe(" Admin dohvaća sve veterinare", () => {
  const baseUrl = "http://localhost:3000";
 
  const adminCredentials = {
    username: "nata",
    lozinka: "admin2",
  };
 
  it("✅ Prijava kao admin i dohvat liste veterinara", () => {
    cy.request("POST", `${baseUrl}/prijava`, adminCredentials).then(
      (loginRes) => {
        expect(loginRes.status).to.eq(200);
        const token = loginRes.body.token;
 
        cy.request({
          method: "GET",
          url: `${baseUrl}/admin/veterinari`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body).to.be.an("array");
          if (res.body.length > 0) {
            expect(res.body[0]).to.include.keys(
              "SIFRA_VETERINARA",
              "ime_veterinara",
              "prezime_veterinara"
            );
          }
        });
      }
    );
  });
});