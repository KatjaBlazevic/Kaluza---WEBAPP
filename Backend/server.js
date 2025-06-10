const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken'); 
const nodemailer = require('nodemailer');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const PORT = process.env.PORT || 3000;
const SECRET_KEY = "tajni_kljuc_za_jwt";
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


app.use(cors({
  origin: 'http://localhost:9000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true 
}));

// 🔹 Povezivanje s bazom
const db = mysql.createConnection({
  host: 'ucka.veleri.hr',
  user: 'kblazevic',
  password: '11',
  database: 'kblazevic'
});

db.connect(err => {
  if (err) {
    console.error('❌ Greška prilikom povezivanja s bazom:', err);
  } else {
    console.log('✅ Povezano s bazom podataka.');
  }
});

// 📌 Ovdje dodajete authenticateToken funkciju!
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Izvucite token iz 'Bearer TOKEN'

  if (token == null) {
    console.warn('❌ Nedostaje JWT token.');
    return res.status(401).json({ poruka: 'Autentifikacija potrebna. Nedostaje token.' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => { // Koristite SECRET_KEY
    if (err) {
      console.warn('❌ Nevažeći JWT token:', err.message);
      return res.status(403).json({ poruka: 'Token nije valjan ili je istekao.' });
    }

    // Dodajte cijeli user payload (id, role, ime, prezime) u req.user
    req.user = user;
    next(); // Nastavite na sljedeći middleware/rutu
  });
};


// REGISTRACIJA (1. KORAK REGISTRACIJE) - AŽURIRANO ZA VIŠESTUPANJSKU REGISTRACIJU
app.post('/registracija', async (req, res) => {
    const { ime, prezime, email, lozinka } = req.body;

    if (!ime || !prezime || !email || !lozinka) {
        return res.status(400).json({ message: 'Sva polja su obavezna.' });
    }

    const insertSql = `
        INSERT INTO Korisnik (ime_korisnika, prezime_korisnika, email_korisnika, lozinka_korisnika)
        VALUES (?, ?, ?, ?)
    `;

    try {
        const [insertResult] = await db.promise().query(insertSql, [ime, prezime, email, lozinka]);

        res.status(201).json({
            message: 'Registracija uspješna. Nastavite na izradu profila.',
            userId: insertResult.insertId 
        });

    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email je već registriran.' });
        }
        console.error('Greška prilikom registracije:', err);
        return res.status(500).json({ message: 'Greška na serveru prilikom registracije.' });
    }
});

// /// IZRADA PROFILA (2. KORAK REGISTRACIJE)
app.put('/izrada-profila', (req, res) => {
    const {
        userId, 
        nadimak,
        adresa,
        mjesto,
        datumRodenja,
        brojTelefona
    } = req.body;

    const sql = `
        UPDATE Korisnik
        SET
            nadimak_korisnika = ?,
            adresa_korisnika = ?,
            mjesto_stanovanja = ?,
            datum_rodenja = ?,
            broj_telefona_korisnika = ?
        WHERE SIFRA_KORISNIKA = ?
    `;

    db.query(sql, [nadimak, adresa, mjesto, datumRodenja, brojTelefona, userId], (err, result) => {
        if (err) {
            console.error('Greška prilikom ažuriranja korisnika:', err);
            return res.status(500).json({ error: 'Greška u bazi podataka' });
        }
        res.json({ message: 'Profil ažuriran' });
    });
});

// IZRADA PROFILA ZA LJUBIMCA (3. KORAK REGISTRACIJE) - AŽURIRANO
app.post('/ljubimci', async (req, res) => {
    const { ime_ljubimca, vrsta_ljubimca, datum_rodenja_ljubimca, kilaza_ljubimca, podaci_o_njezi_ljubimca, podaci_o_prehrani_ljubimca, SIFRA_KORISNIKA } = req.body;

    if (!SIFRA_KORISNIKA) {
        return res.status(400).json({ poruka: 'Greška: SIFRA_KORISNIKA je obavezna.' });
    }

    try {
        // 1. Spremi ljubimca u bazu
        const insertLjubimacSql = `
            INSERT INTO Ljubimac (ime_ljubimca, vrsta_ljubimca, datum_rodenja_ljubimca, kilaza_ljubimca, podaci_o_njezi_ljubimca, podaci_o_prehrani_ljubimca, SIFRA_KORISNIKA)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.promise().query(insertLjubimacSql, [
            ime_ljubimca,
            vrsta_ljubimca,
            datum_rodenja_ljubimca,
            kilaza_ljubimca,
            podaci_o_njezi_ljubimca,
            podaci_o_prehrani_ljubimca,
            SIFRA_KORISNIKA
        ]);

        // 2. Dohvati sve potrebne podatke o korisniku (za token)
        const [userResults] = await db.promise().query(`
            SELECT SIFRA_KORISNIKA, email_korisnika, ime_korisnika, prezime_korisnika, nadimak_korisnika
            FROM Korisnik
            WHERE SIFRA_KORISNIKA = ?
        `, [SIFRA_KORISNIKA]);

        if (userResults.length === 0) {
            // Ovo bi se rijetko trebalo dogoditi ako je SIFRA_KORISNIKA validna iz prethodnih koraka
            return res.status(404).json({ poruka: 'Korisnik nije pronađen nakon dodavanja ljubimca.' });
        }

        const registeredUser = userResults[0];

        // 3. Generiraj JWT token
        const token = jwt.sign(
            {
                id: registeredUser.SIFRA_KORISNIKA,
                role: 'korisnik',
                ime: registeredUser.ime_korisnika,
                prezime: registeredUser.prezime_korisnika,
                email: registeredUser.email_korisnika, // Dodaj email u token ako ti treba na frontendu
                nadimak: registeredUser.nadimak_korisnika // Dodaj nadimak u token ako ti treba na frontendu
            },
            SECRET_KEY, // Provjeri da SECRET_KEY postoji i da je dostupan ovdje
            { expiresIn: '1h' }
        );

        // 4. Pošalji odgovor s tokenom i korisničkim podacima
        res.status(201).json({
            poruka: 'Ljubimac je uspješno dodan. Registracija je dovršena. Korisnik je prijavljen.',
            token: token,
            user: {
                id: registeredUser.SIFRA_KORISNIKA,
                role: 'korisnik',
                ime: registeredUser.ime_korisnika,
                prezime: registeredUser.prezime_korisnika,
                email: registeredUser.email_korisnika,
                nadimak: registeredUser.nadimak_korisnika
            },
            ljubimacId: result.insertId
        });

    } catch (err) {
        console.error('Greška u SQL query-u za ljubimca ili generiranje tokena:', err.message);
        res.status(500).json({ poruka: 'Greška na serveru.', detalji: err.message });
    }
});

// PRIJAVA
app.post('/prijava', async (req, res) => {
    const { username, lozinka } = req.body;

    if (!username || !lozinka) {
        return res.status(400).json({ message: 'Email/nadimak i lozinka su obavezni.' });
    }

    try {
        let korisnik = null;
        let role = '';
        let userId = null;
        let userFirstName = '';
        let userLastName = '';

        // 📌 Provjera administratora
        const [adminResults] = await db.promise().query(`
            SELECT SIFRA_ADMINISTRATORA, nadimak_admina
            FROM Administrator
            WHERE nadimak_admina = ? AND lozinka_admina = ?
        `, [username, lozinka]);

        if (adminResults.length > 0) {
            korisnik = adminResults[0];
            role = 'admin';
            userId = korisnik.SIFRA_ADMINISTRATORA;
            userFirstName = korisnik.nadimak_admina;
            userLastName = '';
        } else { // Koristite else if umjesto ponovnog provjeravanja role === ''
            // 📌 Provjera veterinara
            const [veterinarResults] = await db.promise().query(`
                SELECT SIFRA_VETERINARA, email_veterinara, ime_veterinara, prezime_veterinara
                FROM Veterinar
                WHERE email_veterinara = ? AND lozinka_veterinara = ?
            `, [username, lozinka]);

            if (veterinarResults.length > 0) {
                korisnik = veterinarResults[0];
                role = 'veterinar';
                userId = korisnik.SIFRA_VETERINARA;
                userFirstName = korisnik.ime_veterinara;
                userLastName = korisnik.prezime_veterinara;
            } else {
                // 📌 Provjera korisnika
                const [korisnikResults] = await db.promise().query(`
                    SELECT SIFRA_KORISNIKA, email_korisnika, nadimak_korisnika, ime_korisnika, prezime_korisnika
                    FROM Korisnik
                    WHERE (email_korisnika = ? OR nadimak_korisnika = ?) AND lozinka_korisnika = ?
                `, [username, username, lozinka]);

                if (korisnikResults.length > 0) {
                    korisnik = korisnikResults[0];
                    role = 'korisnik';
                    userId = korisnik.SIFRA_KORISNIKA;
                    userFirstName = korisnik.ime_korisnika;
                    userLastName = korisnik.prezime_korisnika;
                }
            }
        }

        if (!korisnik) {
            return res.status(401).json({ message: 'Neispravan email/nadimak ili lozinka.' });
        }

        // ✅ Generiranje JWT tokena
        const token = jwt.sign(
            {
                id: userId,
                role: role,
                ime: userFirstName,
                prezime: userLastName
            },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Uspješna prijava',
            token,
            user: {
                id: userId,
                role: role,
                ime: userFirstName,
                prezime: userLastName
            }
        });

    } catch (err) {
        console.error('Greška u bazi:', err);
        res.status(500).json({ message: 'Greška na serveru.' });
    }
});

// /api/check-session
app.get('/api/check-session', authenticateToken, (req, res) => {
    if (req.user) {
        res.json({
            authenticated: true,
            user: {
                id: req.user.id,
                ime: req.user.ime,
                prezime: req.user.prezime
            },
            role: req.user.role // ✅ Vraćamo ulogu iz tokena
        });
    } else {
        res.json({ authenticated: false });
    }
});

// /profile
app.get('/profile', authenticateToken, (req, res) => {
    if (req.user) {
        return res.json({
            id: req.user.id,
            ime: req.user.ime,
            prezime: req.user.prezime,
            role: req.user.role // ✅ Dodali rolu korisnika
        });
    } else {
        console.log("❌ Token nije pronađen, korisnik nije prijavljen.");
        return res.status(401).json({ message: 'Korisnik nije prijavljen.' });
    }
});


//AŽURIRANJE PROFILA
app.put('/update-profile', authenticateToken, (req, res) => {
    const korisnikId = req.user.id;

    const { ime, prezime, email, lozinka } = req.body;
    const fieldsToUpdate = {};
    const queryParams = [];

    if (ime) {
        fieldsToUpdate.ime_korisnika = ime;
        queryParams.push(ime);
    }
    if (prezime) {
        fieldsToUpdate.prezime_korisnika = prezime;
        queryParams.push(prezime);
    }
    if (email) {
        fieldsToUpdate.email_korisnika = email;
        queryParams.push(email);
    }

    const updates = Object.entries(fieldsToUpdate);

    if (!updates.length) {
        return res.status(400).json({ error: 'Nema podataka za ažuriranje.' });
    }

    const sqlUpdate = `UPDATE Korisnik SET ${updates.map(([key]) => `${key} = ?`).join(', ')} WHERE SIFRA_KORISNIKA = ?`;

    db.query(sqlUpdate, [...updates.map(([_, value]) => value), korisnikId], (err, result) => {
        if (err) {
            console.error('Greška prilikom ažuriranja profila:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Email je već u upotrebi.' });
            }
            return res.status(500).json({ error: 'Greška prilikom ažuriranja profila u bazi podataka.' });
        }

        db.query(`SELECT SIFRA_KORISNIKA AS id, ime_korisnika AS ime, prezime_korisnika AS prezime, email_korisnika AS email FROM Korisnik WHERE SIFRA_KORISNIKA = ?`, [korisnikId], (err2, rows) => {
            if (err2 || rows.length === 0) {
                console.error('Greška prilikom dohvata ažuriranih podataka:', err2);
                return res.status(500).json({ error: 'Greška prilikom dohvata ažuriranih podataka.' });
            }

            const updatedUser = rows[0];

            // Generiraj novi JWT token s ažuriranim podacima
            const newToken = jwt.sign(
                {
                    id: updatedUser.id,
                    role: req.user.role,
                    ime: updatedUser.ime,
                    prezime: updatedUser.prezime
                },
                SECRET_KEY,
                { expiresIn: '1h' }
            );

            res.json({ message: 'Profil uspješno ažuriran', user: updatedUser, token: newToken });
        });
    });
});


// DOHVATI LJUBIMCE ZA PRIJAVLJENOG KORISNIKA
app.get('/moji-ljubimci', authenticateToken, (req, res) => {
    // Provjeri da li je prijavljeni korisnik zaista 'korisnik'
    if (req.user.role !== 'korisnik') {
        return res.status(403).json({ poruka: 'Nemate dozvolu za pristup kao korisnik.' });
    }

    const SIFRA_KORISNIKA_JWT = req.user.id;

    const sql = `SELECT * FROM Ljubimac WHERE SIFRA_KORISNIKA = ?`;

    db.query(sql, [SIFRA_KORISNIKA_JWT], (err, results) => {
        if (err) {
            console.error('❌ Greška pri dohvaćanju ljubimaca za korisnika:', err);
            return res.status(500).json({ poruka: '❌ Greška na serveru.', detalji: err.message });
        }
        res.json(results);
    });
});

// UREDI POSTOJEĆEG LJUBIMCA
app.put('/uredi-ljubimca/:id', authenticateToken, (req, res) => {
    const SIFRA_LJUBIMCA = req.params.id;
    const korisnikId = req.user.id;
    const korisnikRole = req.user.role;

    const { ime_ljubimca, vrsta_ljubimca, datum_rodenja_ljubimca, kilaza_ljubimca, podaci_o_njezi_ljubimca, podaci_o_prehrani_ljubimca } = req.body;

    if (!SIFRA_LJUBIMCA) {
        return res.status(400).json({ poruka: 'Greška: ID ljubimca je obavezan!' });
    }

    const fetchSql = `SELECT * FROM Ljubimac WHERE SIFRA_LJUBIMCA = ?`;
    db.query(fetchSql, [SIFRA_LJUBIMCA], (err, results) => {
        if (err) {
            console.error('Greška pri dohvaćanju postojećeg ljubimca:', err);
            return res.status(500).json({ poruka: 'Greška na serveru.', detalji: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ poruka: 'Ljubimac nije pronađen.' });
        }

        const ljubimac = results[0];

        // Provjera autorizacije
        if (korisnikRole === 'korisnik' && ljubimac.SIFRA_KORISNIKA !== korisnikId) {
            return res.status(403).json({ poruka: 'Nemate dozvolu za uređivanje ovog ljubimca.' });
        } else if (korisnikRole === 'veterinar') {
            // Provjera da li veterinar ima termine s ovim ljubimcem
            db.query(`SELECT SIFRA_TERMINA FROM Termin WHERE SIFRA_LJUBIMCA = ? AND SIFRA_VETERINARA = ?`, [SIFRA_LJUBIMCA, korisnikId], (termErr, termResults) => {
                if (termErr || termResults.length === 0) {
                    return res.status(403).json({ poruka: 'Nemate dozvolu za uređivanje ovog ljubimca.' });
                }
            });
        }


        const updatedLjubimac = {
            ime_ljubimca: ime_ljubimca || ljubimac.ime_ljubimca,
            vrsta_ljubimca: vrsta_ljubimca || ljubimac.vrsta_ljubimca,
            datum_rodenja_ljubimca: datum_rodenja_ljubimca || ljubimac.datum_rodenja_ljubimca,
            kilaza_ljubimca: kilaza_ljubimca || ljubimac.kilaza_ljubimca,
            podaci_o_njezi_ljubimca: podaci_o_njezi_ljubimca || ljubimac.podaci_o_njezi_ljubimca,
            podaci_o_prehrani_ljubimca: podaci_o_prehrani_ljubimca || ljubimac.podaci_o_prehrani_ljubimca
        };

        const updateSql = `
            UPDATE Ljubimac
            SET ime_ljubimca = ?, vrsta_ljubimca = ?, datum_rodenja_ljubimca = ?, kilaza_ljubimca = ?, podaci_o_njezi_ljubimca = ?, podaci_o_prehrani_ljubimca = ?
            WHERE SIFRA_LJUBIMCA = ?
        `;

        db.query(updateSql, [updatedLjubimac.ime_ljubimca, updatedLjubimac.vrsta_ljubimca, updatedLjubimac.datum_rodenja_ljubimca, updatedLjubimac.kilaza_ljubimca, updatedLjubimac.podaci_o_njezi_ljubimca, updatedLjubimac.podaci_o_prehrani_ljubimca, SIFRA_LJUBIMCA], (err, result) => {
            if (err) {
                console.error('Greška pri ažuriranju ljubimca:', err);
                return res.status(500).json({ poruka: 'Greška na serveru.', detalji: err.message });
            }

            res.json({ poruka: 'Ljubimac uspješno ažuriran.', ljubimac: updatedLjubimac });
        });
    });
});

// DOHVATI POJEDINOG LJUBIMCA (POTREBNO ZA UREĐIVANJE)
app.get('/ljubimac/:id', authenticateToken, (req, res) => {
    const SIFRA_LJUBIMCA = req.params.id;
    const korisnikId = req.user.id;
    const korisnikRole = req.user.role;

    if (!SIFRA_LJUBIMCA) {
        return res.status(400).json({ poruka: 'Greška: ID ljubimca je obavezan!' });
    }

    const sql = `SELECT * FROM Ljubimac WHERE SIFRA_LJUBIMCA = ?`;
    db.query(sql, [SIFRA_LJUBIMCA], (err, results) => {
        if (err) {
            console.error('Greška pri dohvaćanju ljubimca:', err);
            return res.status(500).json({ poruka: 'Greška na serveru.', detalji: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ poruka: 'Ljubimac nije pronađen.' });
        }

        const ljubimac = results[0];

        // Provjera autorizacije
        if (korisnikRole === 'korisnik' && ljubimac.SIFRA_KORISNIKA !== korisnikId) {
            return res.status(403).json({ poruka: 'Nemate dozvolu za pregled ovog ljubimca.' });
        } else if (korisnikRole === 'veterinar') {
            // Provjera da li veterinar ima termine s ovim ljubimcem
            db.query(`SELECT SIFRA_TERMINA FROM Termin WHERE SIFRA_LJUBIMCA = ? AND SIFRA_VETERINARA = ?`, [SIFRA_LJUBIMCA, korisnikId], (termErr, termResults) => {
                if (termErr || termResults.length === 0) {
                    return res.status(403).json({ poruka: 'Nemate dozvolu za pregled ovog ljubimca.' });
                }
            });
        }
        res.json(ljubimac);
    });
});

app.delete('/obrisi-ljubimca/:id', authenticateToken, (req, res) => {
    const SIFRA_LJUBIMCA = req.params.id;
    const korisnikId = req.user.id;
    const korisnikRole = req.user.role;

    if (!SIFRA_LJUBIMCA) {
        return res.status(400).json({ poruka: 'Greška: ID ljubimca je obavezan!' });
    }

    let sql;
    let params;

    if (korisnikRole === 'korisnik') {
        sql = `DELETE FROM Ljubimac WHERE SIFRA_LJUBIMCA = ? AND SIFRA_KORISNIKA = ?`;
        params = [SIFRA_LJUBIMCA, korisnikId];
    } else if (korisnikRole === 'veterinar') {
        sql = `
            DELETE FROM Ljubimac
            WHERE SIFRA_LJUBIMCA = ?
            AND SIFRA_LJUBIMCA IN (SELECT SIFRA_LJUBIMCA FROM Termin WHERE SIFRA_VETERINARA = ?)
        `;
        params = [SIFRA_LJUBIMCA, korisnikId];
    } else {
        return res.status(403).json({ poruka: 'Nemate dozvolu za ovu radnju.' });
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error('Greška pri brisanju ljubimca:', err);
            return res.status(500).json({ poruka: 'Greška na serveru.', detalji: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ poruka: 'Ljubimac nije pronađen ili nemate dozvolu za brisanje.' });
        }

        res.json({ poruka: 'Ljubimac uspješno obrisan.' });
    });
});

/// DOHVAĆANJE SLIKA IZ BAZE
app.get('/galerija', authenticateToken, (req, res) => {
    const korisnikId = req.user.id; // ID korisnika dolazi iz JWT-a

    const sql = `
        SELECT SIFRA_SLIKE, naziv_slike, opis_slike, DATE_FORMAT(datum_objave, '%d.%m.%Y.') AS datum_objave, slika
        FROM Slike
        WHERE SIFRA_KORISNIKA = ?
        ORDER BY datum_objave DESC
    `;

    db.query(sql, [korisnikId], (err, results) => {
        if (err) {
            console.error('Greška pri dohvaćanju galerije:', err);
            return res.status(500).json({ poruka: 'Greška na serveru.', detalji: err.message });
        }

        res.json(results.map(slika => ({
            SIFRA_SLIKE: slika.SIFRA_SLIKE,
            naziv_slike: slika.naziv_slike,
            opis_slike: slika.opis_slike,
            datum_objave: slika.datum_objave,
            slika: slika.slika ? `data:image/jpeg;base64,${Buffer.from(slika.slika).toString('base64')}` : null
        })));
    });
});

// DODAVANJE SLIKA U BAZU
app.post('/dodaj-sliku', authenticateToken, upload.single('slika'), async (req, res) => {
    const korisnikId = req.user.id; // ID korisnika dolazi iz JWT-a

    if (!req.file) {
        return res.status(400).json({ poruka: 'Nema datoteke slike za upload.' });
    }

    const { naziv_slike, opis_slike } = req.body;
    const slikaBuffer = req.file.buffer;

    const sql = `
        INSERT INTO Slike (SIFRA_KORISNIKA, slika, naziv_slike, opis_slike, datum_objave)
        VALUES (?, ?, ?, ?, CURDATE())
    `;

    db.query(sql, [korisnikId, slikaBuffer, naziv_slike, opis_slike], (err, result) => {
        if (err) {
            console.error('Greška pri dodavanju slike:', err);
            return res.status(500).json({ poruka: 'Greška na serveru.', detalji: err.message });
        }

        res.json({ poruka: 'Slika uspješno dodana!', SIFRA_SLIKE: result.insertId });
    });
});

// PREGLED POJEDINACNE SLIKE
app.get('/slika/:SIFRA_SLIKE', authenticateToken, (req, res) => {
    const slikaId = req.params.SIFRA_SLIKE;
    const korisnikId = req.user.id;
    const korisnikRole = req.user.role;

    const sql = `
        SELECT SIFRA_SLIKE, naziv_slike, opis_slike, DATE_FORMAT(datum_objave, '%d.%m.%Y.') AS datum_objave, slika, SIFRA_KORISNIKA
        FROM Slike
        WHERE SIFRA_SLIKE = ?
    `;

    db.query(sql, [slikaId], (err, results) => {
        if (err) {
            console.error('Greška pri dohvaćanju slike:', err);
            return res.status(500).json({ poruka: 'Greška na serveru.', detalji: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ poruka: 'Slika nije pronađena.' });
        }

        const slikaPodaci = results[0];

        // Provjera autorizacije: Korisnik može vidjeti samo svoje slike. Veterinar i Admin mogu vidjeti sve.
        if (korisnikRole === 'korisnik' && slikaPodaci.SIFRA_KORISNIKA !== korisnikId) {
            return res.status(403).json({ poruka: 'Nemate dozvolu za pregled ove slike.' });
        }
        // Ako je veterinar ili admin, ne treba dodatna provjera SIFRA_KORISNIKA

        const slikaBase64 = slikaPodaci.slika
            ? `data:image/jpeg;base64,${Buffer.from(slikaPodaci.slika).toString('base64')}`
            : null;

        res.json({
            SIFRA_SLIKE: slikaPodaci.SIFRA_SLIKE,
            naziv_slike: slikaPodaci.naziv_slike,
            opis_slike: slikaPodaci.opis_slike,
            datum_objave: slikaPodaci.datum_objave,
            slika: slikaBase64
        });
    });
});

// UREĐIVANJE SLIKE
app.put('/slika/:SIFRA_SLIKE', authenticateToken, (req, res) => {
    const slikaId = req.params.SIFRA_SLIKE;
    const korisnikId = req.user.id;
    const korisnikRole = req.user.role;
    const { naziv_slike, opis_slike } = req.body;

    let sql = 'UPDATE Slike SET ';
    const fields = [];
    const values = [];

    if (naziv_slike !== undefined && naziv_slike !== null) {
        fields.push('naziv_slike = ?');
        values.push(naziv_slike);
    }
    if (opis_slike !== undefined && opis_slike !== null) {
        fields.push('opis_slike = ?');
        values.push(opis_slike);
    }

    if (fields.length === 0) {
        return res.status(400).json({ poruka: 'Nema podataka za ažuriranje.' });
    }

    // Prvo provjeri je li korisnik vlasnik slike ili ima odgovarajuću ulogu
    db.query('SELECT SIFRA_KORISNIKA FROM Slike WHERE SIFRA_SLIKE = ?', [slikaId], (err, results) => {
        if (err) {
            console.error('Greška pri provjeri vlasništva slike:', err);
            return res.status(500).json({ poruka: 'Greška na serveru.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ poruka: 'Slika nije pronađena.' });
        }

        const slikaVlasnikId = results[0].SIFRA_KORISNIKA;

        // Korisnik može uređivati samo svoje slike
        if (korisnikRole === 'korisnik' && slikaVlasnikId !== korisnikId) {
            return res.status(403).json({ poruka: 'Nemate dozvolu za uređivanje ove slike.' });
        }
        // Veterinar i Admin mogu uređivati sve slike - ova logika se dodaje ako to želiš
        // Trenutno ostavljamo samo korisnika i njegovu sliku.

        sql += fields.join(', ') + ' WHERE SIFRA_SLIKE = ?';
        values.push(slikaId);

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('Greška pri ažuriranju slike:', err);
                return res.status(500).json({ poruka: 'Greška na serveru.', detalji: err.message });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ poruka: 'Slika nije pronađena ili nije bilo promjena.' });
            }

            res.json({ poruka: 'Slika uspješno ažurirana!' });
        });
    });
});

// BRISANJE SLIKE
app.delete('/slika/:SIFRA_SLIKE', authenticateToken, (req, res) => {
    const slikaId = req.params.SIFRA_SLIKE;
    const korisnikId = req.user.id;
    const korisnikRole = req.user.role;

    // Prvo provjeri je li korisnik vlasnik slike
    db.query('SELECT SIFRA_KORISNIKA FROM Slike WHERE SIFRA_SLIKE = ?', [slikaId], (err, results) => {
        if (err) {
            console.error('Greška pri provjeri vlasništva slike:', err);
            return res.status(500).json({ poruka: 'Greška na serveru.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ poruka: 'Slika nije pronađena.' });
        }

        const slikaVlasnikId = results[0].SIFRA_KORISNIKA;

        // Korisnik može brisati samo svoje slike
        if (korisnikRole === 'korisnik' && slikaVlasnikId !== korisnikId) {
            return res.status(403).json({ poruka: 'Nemate dozvolu za brisanje ove slike.' });
        }
        // Ako je veterinar ili admin, ne treba dodatna provjera SIFRA_KORISNIKA.
        // Opet, samo korisnik je ovdje, ako želiš da i veterinar/admin briše, trebaš dodati njihove role.

        const sql = 'DELETE FROM Slike WHERE SIFRA_SLIKE = ?';
        db.query(sql, [slikaId], (err, result) => {
            if (err) {
                console.error('Greška pri brisanju slike:', err);
                return res.status(500).json({ poruka: 'Greška na serveru.', detalji: err.message });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ poruka: 'Slika nije pronađena.' });
            }

            res.json({ poruka: 'Slika uspješno obrisana!' });
        });
    });
});

// DOHVAĆANJE SVIH PODSJETNIKA
app.get("/podsjetnici", authenticateToken, (req, res) => {
    // SIFRA_KORISNIKA sada dolazi iz dekodiranog JWT tokena, kao 'id'
    const SIFRA_KORISNIKA_JWT = req.user.id; // ✅ PROMJENJENO: koristiti req.user.id

    const sql = `
        SELECT SIFRA_PODSJETNIKA, naziv_podsjetnika, opis_podsjetnika,
               DATE_FORMAT(datum_podsjetnika, '%Y-%m-%d') AS datum_podsjetnika,
               TIME_FORMAT(vrijeme_podsjetnika, '%H:%i') AS vrijeme_podsjetnika,
               SIFRA_TERMINA, SIFRA_DOGADAJA,
               SIFRA_KORISNIKA,
               CASE
                 WHEN SIFRA_TERMINA IS NOT NULL THEN 'termin'
                 WHEN SIFRA_DOGADAJA IS NOT NULL THEN 'dogadaj'
                 ELSE 'privatno'
               END AS tip_podsjetnika
        FROM Podsjetnik
        WHERE SIFRA_KORISNIKA = ?
        ORDER BY datum_podsjetnika DESC, vrijeme_podsjetnika ASC
    `;

    db.query(sql, [SIFRA_KORISNIKA_JWT], (err, results) => {
        if (err) {
            console.error("Greška pri dohvaćanju podsjetnika:", err);
            return res.status(500).json({ poruka: "Greška na serveru." });
        }
        res.json(results);
    });
});

// DODAVANJE PODSJETNIKA
app.post("/podsjetnici", authenticateToken, (req, res) => {
    let { naziv_podsjetnika, opis_podsjetnika, datum_podsjetnika, vrijeme_podsjetnika, tip_podsjetnika } = req.body;
    const SIFRA_KORISNIKA_JWT = req.user.id; // ✅ PROMJENJENO: koristiti req.user.id

    // Pravilna konverzija datuma (`DD.MM.YYYY.` → `YYYY-MM-DD`)
    if (datum_podsjetnika.includes(".")) {
        const dateParts = datum_podsjetnika.split(".");
        if (dateParts.length === 3) {
            datum_podsjetnika = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
        }
    }

    let sifraTermina = null;
    let sifraDogadaja = null;

    if (tip_podsjetnika === "termin") {
        sifraTermina = SIFRA_KORISNIKA_JWT;
    } else if (tip_podsjetnika === "dogadaj") {
        sifraDogadaja = SIFRA_KORISNIKA_JWT;
    }

    const insertSql = `
        INSERT INTO Podsjetnik (naziv_podsjetnika, opis_podsjetnika, datum_podsjetnika, vrijeme_podsjetnika, SIFRA_KORISNIKA, SIFRA_TERMINA, SIFRA_DOGADAJA)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(insertSql, [naziv_podsjetnika, opis_podsjetnika, datum_podsjetnika, vrijeme_podsjetnika, SIFRA_KORISNIKA_JWT, sifraTermina, sifraDogadaja], (err) => {
        if (err) {
            console.error("❌ Greška pri dodavanju podsjetnika:", err);
            return res.status(500).json({ poruka: "❌ Greška na serveru.", detalji: err.message });
        }

        res.status(201).json({ poruka: "✅ Podsjetnik uspješno dodan." });
    });
});

// AŽURIRANJE PODSJETNIKA
app.put("/podsjetnici/:id", authenticateToken, (req, res) => {
    const podsjetnikId = req.params.id;
    let { naziv_podsjetnika, opis_podsjetnika, datum_podsjetnika, vrijeme_podsjetnika, tip_podsjetnika } = req.body;
    const SIFRA_KORISNIKA_JWT = req.user.id; // ✅ PROMJENJENO: koristiti req.user.id

    // Konverzija datuma iz DD.MM.YYYY u YYYY-MM-DD za MySQL (ako frontend šalje u tom formatu)
    if (datum_podsjetnika && datum_podsjetnika.includes(".")) {
        const dateParts = datum_podsjetnika.split(".");
        if (dateParts.length === 3) {
            datum_podsjetnika = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
        }
    }

    let finalSIFRATERMINA = null;
    let finalSIFRADOGADAJA = null;

    if (tip_podsjetnika === "termin") {
        finalSIFRATERMINA = SIFRA_KORISNIKA_JWT;
        finalSIFRADOGADAJA = null;
    } else if (tip_podsjetnika === "dogadaj") {
        finalSIFRADOGADAJA = SIFRA_KORISNIKA_JWT;
        finalSIFRATERMINA = null;
    } else if (tip_podsjetnika === "privatno") {
        finalSIFRATERMINA = null;
        finalSIFRADOGADAJA = null;
    }

    const updateSql = `
        UPDATE Podsjetnik
        SET naziv_podsjetnika = ?, opis_podsjetnika = ?, datum_podsjetnika = ?, vrijeme_podsjetnika = ?, SIFRA_TERMINA = ?, SIFRA_DOGADAJA = ?
        WHERE SIFRA_PODSJETNIKA = ? AND SIFRA_KORISNIKA = ?
    `;

    db.query(updateSql, [naziv_podsjetnika, opis_podsjetnika, datum_podsjetnika, vrijeme_podsjetnika, finalSIFRATERMINA, finalSIFRADOGADAJA, podsjetnikId, SIFRA_KORISNIKA_JWT], (err, result) => {
        if (err) {
            console.error("❌ Greška pri ažuriranju podsjetnika:", err);
            return res.status(500).json({ poruka: "❌ Greška na serveru.", detalji: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ poruka: "Podsjetnik nije pronađen ili nemate dozvolu za ažuriranje." });
        }
        res.json({ poruka: "✅ Podsjetnik uspješno ažuriran." });
    });
});

// BRISANJE PODSJETNIKA
app.delete("/podsjetnici/:id", authenticateToken, (req, res) => {
    const podsjetnikId = req.params.id;
    const SIFRA_KORISNIKA_JWT = req.user.id; // ✅ PROMJENJENO: koristiti req.user.id

    const sql = `
        DELETE FROM Podsjetnik
        WHERE SIFRA_PODSJETNIKA = ? AND SIFRA_KORISNIKA = ?
    `;

    db.query(sql, [podsjetnikId, SIFRA_KORISNIKA_JWT], (err, result) => {
        if (err) {
            console.error("❌ Greška pri brisanju podsjetnika:", err);
            return res.status(500).json({ poruka: "❌ Greška na serveru.", detalji: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ poruka: "Podsjetnik nije pronađen ili nemate dozvolu za brisanje." });
        }
        res.json({ poruka: "✅ Podsjetnik uspješno obrisan." });
    });
});


// DOHVAĆANJE DNEVNIKA
app.get("/dnevnik", authenticateToken, (req, res) => {
    const SIFRA_KORISNIKA_JWT = req.user.id;

    const sql = `
        SELECT SIFRA_DNEVNIKA, naziv_zapisa, tekst_zapisa,
               DATE_FORMAT(datum_zapisa, '%Y-%m-%d') AS datum_zapisa,
               TIME_FORMAT(vrijeme_zapisa, '%H:%i') AS vrijeme_zapisa,
               SIFRA_KORISNIKA
        FROM Dnevnik
        WHERE SIFRA_KORISNIKA = ?
        ORDER BY datum_zapisa DESC, vrijeme_zapisa DESC
    `;

    db.query(sql, [SIFRA_KORISNIKA_JWT], (err, results) => {
        if (err) {
            console.error("Greška pri dohvaćanju unosa dnevnika:", err);
            return res.status(500).json({ poruka: "Greška na serveru.", detalji: err.message });
        }
        res.json(results);
    });
});

// DODAVANJE UNOSA U DNEVNIK
app.post('/dnevnik', authenticateToken, (req, res) => {
    let { naziv_zapisa, tekst_zapisa, datum_zapisa, vrijeme_zapisa } = req.body;
    const SIFRA_KORISNIKA_JWT = req.user.id;

    const sql = `
        INSERT INTO Dnevnik (naziv_zapisa, tekst_zapisa, datum_zapisa, vrijeme_zapisa, SIFRA_KORISNIKA)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [naziv_zapisa, tekst_zapisa, datum_zapisa, vrijeme_zapisa, SIFRA_KORISNIKA_JWT], (err, result) => {
        if (err) {
            console.error("Greška pri dodavanju unosa dnevnika:", err);
            return res.status(500).json({ poruka: "Greška na serveru.", detalji: err.sqlMessage || err.message });
        }
        res.status(201).json({ poruka: "Unos dnevnika uspješno dodan.", id: result.insertId });
    });
});


// AŽURIRANJE UNOSA
app.put("/dnevnik/:id", authenticateToken, (req, res) => {
    const unosId = req.params.id;
    let { naziv_zapisa, tekst_zapisa, datum_zapisa, vrijeme_zapisa } = req.body;
    const SIFRA_KORISNIKA_JWT = req.user.id;

    const updateSql = `
        UPDATE Dnevnik
        SET naziv_zapisa = ?, tekst_zapisa = ?, datum_zapisa = ?, vrijeme_zapisa = ?
        WHERE SIFRA_DNEVNIKA = ? AND SIFRA_KORISNIKA = ?
    `;

    db.query(updateSql, [naziv_zapisa, tekst_zapisa, datum_zapisa, vrijeme_zapisa, unosId, SIFRA_KORISNIKA_JWT], (err, result) => {
        if (err) {
            console.error("Greška pri ažuriranju unosa dnevnika:", err);
            return res.status(500).json({ poruka: "Greška na serveru.", detalji: err.sqlMessage || err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ poruka: "Unos dnevnika nije pronađen ili nemate dozvolu za ažuriranje." });
        }
        res.json({ poruka: "Unos dnevnika uspješno ažuriran." });
    });
});
// AŽURIRANJE UNOSA 
app.put("/dnevnik/:id", authenticateToken, (req, res) => { 

    const unosId = req.params.id;
    let { naziv_zapisa, tekst_zapisa, datum_zapisa, vrijeme_zapisa } = req.body;
    const SIFRA_KORISNIKA_JWT = req.user.id; // Uzimamo SIFRA_KORISNIKA iz JWT tokena

    const updateSql = `
        UPDATE Dnevnik
        SET naziv_zapisa = ?, tekst_zapisa = ?, datum_zapisa = ?, vrijeme_zapisa = ?
        WHERE SIFRA_DNEVNIKA = ? AND SIFRA_KORISNIKA = ?
    `;


    db.query(updateSql, [naziv_zapisa, tekst_zapisa, datum_zapisa, vrijeme_zapisa, unosId, SIFRA_KORISNIKA_JWT], (err, result) => {
        if (err) {
            console.error("Greška pri ažuriranju unosa dnevnika:", err);
            return res.status(500).json({ poruka: "Greška na serveru.", detalji: err.sqlMessage || err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ poruka: "Unos dnevnika nije pronađen ili nemate dozvolu za ažuriranje." });
        }
        res.json({ poruka: "Unos dnevnika uspješno ažuriran." });
    });
});

// BRISANJE UNOSA 
app.delete("/dnevnik/:id", authenticateToken, (req, res) => { 
    const unosId = req.params.id;
    const SIFRA_KORISNIKA_JWT = req.user.id; // Uzimamo SIFRA_KORISNIKA iz JWT tokena

    const sql = `
        DELETE FROM Dnevnik
        WHERE SIFRA_DNEVNIKA = ? AND SIFRA_KORISNIKA = ?
    `;

    db.query(sql, [unosId, SIFRA_KORISNIKA_JWT], (err, result) => { // Koristimo SIFRA_KORISNIKA_JWT
        if (err) {
            console.error("Greška pri brisanju unosa dnevnika:", err);
            return res.status(500).json({ poruka: "Greška na serveru.", detalji: err.sqlMessage || err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ poruka: "Unos dnevnika nije pronađen ili nemate dozvolu za brisanje." });
        }
        res.json({ poruka: "Unos dnevnika uspješno obrisan." });
    });
});

// DOHVAĆANJE TERMINA ZA KORISNIKA
app.get("/termini", authenticateToken, (req, res) => {
    // SIFRA_KORISNIKA se sada dohvaća iz JWT tokena
    const SIFRA_KORISNIKA_JWT = req.user.id; 

    const sql = `
        SELECT t.SIFRA_TERMINA, t.datum_termina, t.vrijeme_termina, t.status_termina,
               t.simptomi_ljubimca, t.razlog_posjete,
               l.ime_ljubimca, v.ime_veterinara, v.prezime_veterinara, v.specijalizacija_veterinara
        FROM Termin t
        LEFT JOIN Ljubimac l ON t.SIFRA_LJUBIMCA = l.SIFRA_LJUBIMCA
        LEFT JOIN Veterinar v ON t.SIFRA_VETERINARA = v.SIFRA_VETERINARA
        WHERE t.SIFRA_KORISNIKA = ?
        ORDER BY t.datum_termina DESC, t.vrijeme_termina ASC
    `;
    const params = [SIFRA_KORISNIKA_JWT]; // Koristimo SIFRA_KORISNIKA iz JWT-a

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("❌ Greška pri dohvaćanju termina za korisnika:", err);
            return res.status(500).json({ poruka: "❌ Greška na serveru prilikom dohvaćanja termina." });
        }
        res.json(results);
    });
});

// KORISNIK - TRETMANI
app.get('/tretmani/termin/:SIFRA_TERMINA', authenticateToken, async (req, res) => {
    const { SIFRA_TERMINA } = req.params;
    const SIFRA_KORISNIKA_JWT = req.user.id; 

    try {
        db.query(
            `SELECT t.*, l.ime_ljubimca 
             FROM Tretman t
             JOIN Ljubimac l ON t.SIFRA_LJUBIMCA = l.SIFRA_LJUBIMCA
             WHERE t.SIFRA_TERMINA = ? AND l.SIFRA_KORISNIKA = ?`, 
            [SIFRA_TERMINA, SIFRA_KORISNIKA_JWT], // Koristimo SIFRA_KORISNIKA iz JWT-a
            (error, results) => {
                if (error) {
                    console.error("Greška pri dohvaćanju tretmana:", error);
                    return res.status(500).json({ message: "Greška pri dohvaćanju tretmana." });
                }
      
                res.json(results);
            }
        );
    } catch (error) {
        console.error("Greška pri dohvaćanju tretmana:", error);
        res.status(500).json({ message: "Greška pri dohvaćanju tretmana." });
    }
});

// UREDI TERMIN - KORISNIK
app.put("/uredi-termin-korisnik/:id", authenticateToken, async (req, res) => {
    const terminId = req.params.id;
    const { datum_termina, vrijeme_termina, simptomi_ljubimca, razlog_posjete } = req.body;
    const SIFRA_KORISNIKA_JWT = req.user.id; // Dohvaćamo SIFRA_KORISNIKA iz JWT tokena

    try {
        const sql = `
            UPDATE Termin 
            SET datum_termina = ?, vrijeme_termina = ?, simptomi_ljubimca = ?, razlog_posjete = ?
            WHERE SIFRA_TERMINA = ? AND SIFRA_KORISNIKA = ?
        `;

        const params = [datum_termina, vrijeme_termina, simptomi_ljubimca, razlog_posjete, terminId, SIFRA_KORISNIKA_JWT];

        db.query(sql, params, (err, result) => { // Dodan 'result' za provjeru affectedRows
            if (err) {
                console.error("❌ Greška pri ažuriranju termina:", err);
                return res.status(500).json({ poruka: "❌ Greška na serveru.", detalji: err.message });
            }

            if (result.affectedRows === 0) {
                // Ako nema zahvaćenih redaka, znači da termin ne postoji ili korisnik nema dozvolu
                return res.status(404).json({ poruka: "❌ Termin nije pronađen ili nemate dozvolu za ažuriranje." });
            }

            res.json({ poruka: "✅ Termin uspješno ažuriran." });
        });
    } catch (error) {
        console.error("❌ Došlo je do pogreške:", error);
        res.status(500).json({ poruka: "❌ Greška na serveru." });
    }
});

// ZAKAŽI TERMIN
app.post("/zakazi-termin", authenticateToken, async (req, res) => {
    const { datum_termina, vrijeme_termina, simptomi_ljubimca, razlog_posjete, SIFRA_LJUBIMCA, SIFRA_VETERINARA } = req.body;
    const SIFRA_KORISNIKA_JWT = req.user.id; // Dohvaćamo SIFRA_KORISNIKA iz JWT tokena

    try {
        const sql = `
            INSERT INTO Termin (datum_termina, vrijeme_termina, simptomi_ljubimca, razlog_posjete, SIFRA_LJUBIMCA, SIFRA_VETERINARA, SIFRA_KORISNIKA)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        // SIFRA_KORISNIKA_JWT je zadnji parametar
        const params = [datum_termina, vrijeme_termina, simptomi_ljubimca, razlog_posjete, SIFRA_LJUBIMCA, SIFRA_VETERINARA, SIFRA_KORISNIKA_JWT];

        db.query(sql, params, (err) => {
            if (err) {
                console.error("❌ Greška pri zakazivanju termina:", err);
                return res.status(500).json({ poruka: "❌ Greška na serveru.", detalji: err.message });
            }

            res.status(201).json({ poruka: "✅ Termin uspješno zakazan." }); // Status 201 za kreiran resurs
        });
    } catch (error) {
        console.error("❌ Došlo je do pogreške:", error);
        res.status(500).json({ poruka: "❌ Greška na serveru." });
    }
});

// OTKAŽI TERMIN - KORISNIK
app.put("/otkazi-termin-korisnik/:id", authenticateToken, async (req, res) => {
    const terminId = req.params.id;
    const SIFRA_KORISNIKA_JWT = req.user.id; // Dohvaćamo SIFRA_KORISNIKA iz JWT tokena

    try {
        const sql = `
            UPDATE Termin 
            SET status_termina = 'Canceled'
            WHERE SIFRA_TERMINA = ? AND SIFRA_KORISNIKA = ?
        `;

        db.query(sql, [terminId, SIFRA_KORISNIKA_JWT], (err, results) => { // Dodan SIFRA_KORISNIKA_JWT
            if (err) {
                console.error("❌ Greška pri otkazivanju termina:", err);
                return res.status(500).json({ poruka: "❌ Greška na serveru.", detalji: err.message });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ poruka: "❌ Termin nije pronađen ili nemate dozvolu za otkazivanje." });
            }

            res.json({ poruka: "✅ Termin uspješno otkazan." });
        });
    } catch (error) {
        console.error("❌ Došlo je do pogreške:", error);
        res.status(500).json({ poruka: "❌ Greška na serveru." });
    }
});

// DOHVATI LJUBIMCE - VETERINAR
app.get('/veterinar/moji-ljubimci', authenticateToken, (req, res) => {
    // 🛂 Provjera uloge: Samo 'veterinar' može pristupiti ovoj ruti
    if (req.user.role !== 'veterinar') {
        return res.status(403).json({ poruka: 'Nemate dozvolu za pristup kao veterinar.' });
    }

    // Dobivamo ID veterinara iz JWT tokena
    const SIFRA_VETERINARA_JWT = req.user.id;

    const sql = `
        SELECT DISTINCT l.*
        FROM Ljubimac l
        JOIN Termin t ON l.SIFRA_LJUBIMCA = t.SIFRA_LJUBIMCA
        WHERE t.SIFRA_VETERINARA = ?
    `;

    db.query(sql, [SIFRA_VETERINARA_JWT], (err, results) => {
        if (err) {
            console.error('❌ Greška pri dohvaćanju ljubimaca za veterinara:', err);
            // Vratite detalje greške samo u developmentu, ne u produkciji
            return res.status(500).json({ poruka: '❌ Greška na serveru.', detalji: err.message });
        }
        res.json(results);
    });
});


// DOHVAĆANJE TERMINA ZA VETERINARA
app.get("/veterinar/termini", authenticateToken, (req, res) => {
    // 🛂 Provjera uloge: Samo 'veterinar' može pristupiti ovoj ruti
    if (req.user.role !== 'veterinar') {
        return res.status(403).json({ poruka: "Niste autorizirani za pregled termina." });
    }

    // Dobivamo ID veterinara iz JWT tokena
    const SIFRA_VETERINARA_JWT = req.user.id;

    const sql = `
        SELECT t.SIFRA_TERMINA, t.datum_termina, t.vrijeme_termina, t.status_termina,
               t.simptomi_ljubimca, t.razlog_posjete,
               l.SIFRA_LJUBIMCA, l.ime_ljubimca,
               k.ime_korisnika, k.prezime_korisnika, k.email_korisnika, k.broj_telefona_korisnika
        FROM Termin t
        LEFT JOIN Ljubimac l ON t.SIFRA_LJUBIMCA = l.SIFRA_LJUBIMCA
        LEFT JOIN Korisnik k ON t.SIFRA_KORISNIKA = k.SIFRA_KORISNIKA
        WHERE t.SIFRA_VETERINARA = ?
        ORDER BY t.datum_termina DESC, t.vrijeme_termina ASC
    `;
    const params = [SIFRA_VETERINARA_JWT];

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("❌ Greška pri dohvaćanju termina za veterinara:", err);
            return res.status(500).json({ poruka: "❌ Greška na serveru prilikom dohvaćanja termina." });
        }
        res.json(results);
    });
});


// UREĐIVANJE TERMINA - VETERINAR
app.put('/termini/:SIFRA_TERMINA/status', authenticateToken, async (req, res) => {
  const { SIFRA_TERMINA } = req.params;
  const { status_termina } = req.body;

  // 🛂 Provjera uloge: Samo 'veterinar' može ažurirati status termina
  if (req.user.role !== 'veterinar') {
    return res.status(403).json({ message: 'Neautoriziran pristup. Samo veterinari mogu mijenjati status termina.' });
  }

  // Dobivamo ID veterinara iz JWT tokena kako bismo osigurali da veterinar mijenja samo SVOJE termine
  const SIFRA_VETERINARA_JWT = req.user.id;

  try {
    // Provjeri postoji li termin i pripada li prijavljenom veterinaru
    const [currentTermin] = await db.promise().query(
      "SELECT SIFRA_VETERINARA FROM Termin WHERE SIFRA_TERMINA = ?",
      [SIFRA_TERMINA]
    );

    if (currentTermin.length === 0) {
      return res.status(404).json({ message: "Termin nije pronađen." });
    }

    if (currentTermin[0].SIFRA_VETERINARA !== SIFRA_VETERINARA_JWT) {
        return res.status(403).json({ message: "Nemate dozvolu za uređivanje ovog termina. Termin ne pripada Vama." });
    }

    // Ažuriraj status termina
    const sql = `
      UPDATE Termin
      SET status_termina = ?
      WHERE SIFRA_TERMINA = ? AND SIFRA_VETERINARA = ?
    `;

    await db.promise().query(sql, [status_termina, SIFRA_TERMINA, SIFRA_VETERINARA_JWT]);

    res.json({ message: "Status termina uspješno ažuriran.", novi_status: status_termina });
  } catch (err) {
    console.error("Greška pri ažuriranju statusa termina:", err);
    res.status(500).json({ message: "Greška na serveru." });
  }
});


// VETERINARI - DOHVAĆANJE TRETMANA
app.get('/tretmani/veterinar', authenticateToken, (req, res) => {
  // 🛂 Provjera uloge: Samo 'veterinar' može pristupiti ovoj ruti
  if (req.user.role !== 'veterinar') {
    return res.status(403).json({ message: 'Nemate dozvolu za pristup kao veterinar.' });
  }

  const SIFRA_VETERINARA_JWT = req.user.id; // Dobivamo ID veterinara iz JWT tokena

  db.query(
    `SELECT t.*, l.ime_ljubimca, k.ime_korisnika AS ime_vlasnika, k.prezime_korisnika AS prezime_vlasnika
     FROM Tretman t
     JOIN Ljubimac l ON t.SIFRA_LJUBIMCA = l.SIFRA_LJUBIMCA
     JOIN Korisnik k ON l.SIFRA_KORISNIKA = k.SIFRA_KORISNIKA
     WHERE t.SIFRA_VETERINARA = ?
     ORDER BY t.datum_lijecenja DESC, t.vrijeme_lijecenja DESC`, // Dodano sortiranje za bolji pregled
    [SIFRA_VETERINARA_JWT],
    (error, results) => {
      if (error) {
        console.error("Greška pri dohvaćanju tretmana veterinara:", error);
        return res.status(500).json({ message: "Greška pri dohvaćanju tretmana veterinara." });
      }

      res.json(results);
    }
  );
});

// VETERINARI - UNOS TRETMANA
app.post('/tretmani', authenticateToken, (req, res) => {
  // 🛂 Provjera uloge: Samo 'veterinar' može unositi tretmane
  if (req.user.role !== 'veterinar') {
    return res.status(403).json({ message: 'Nemate dozvolu za unos tretmana.' });
  }

  const SIFRA_VETERINARA_JWT = req.user.id; // Dobivamo ID veterinara iz JWT tokena
  const { datum_lijecenja, vrijeme_lijecenja, bolest_ljubimca, lijecenje_ljubimca, SIFRA_LJUBIMCA, SIFRA_TERMINA } = req.body;

  // Dodatna provjera: Provjerite je li SIFRA_LJUBIMCA i SIFRA_TERMINA obavezna (ovisno o logici aplikacije)
  if (!SIFRA_LJUBIMCA || !datum_lijecenja || !vrijeme_lijecenja || !bolest_ljubimca || !lijecenje_ljubimca) {
      return res.status(400).json({ message: "Sva polja za tretman su obavezna." });
  }

  db.query(
    `INSERT INTO Tretman (datum_lijecenja, vrijeme_lijecenja, bolest_ljubimca, lijecenje_ljubimca, SIFRA_VETERINARA, SIFRA_LJUBIMCA, SIFRA_TERMINA)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [datum_lijecenja, vrijeme_lijecenja, bolest_ljubimca, lijecenje_ljubimca, SIFRA_VETERINARA_JWT, SIFRA_LJUBIMCA, SIFRA_TERMINA || null], // Termin je opcionalan
    (error, results) => {
      if (error) {
        console.error("Greška pri unosu tretmana:", error);
        // Provjerite specifične greške baze podataka ako je potrebno (npr. strani ključevi)
        return res.status(500).json({ message: "Greška pri unosu tretmana.", detalji: error.message });
      }
      res.status(201).json({ message: "Tretman uspješno unesen!", tretmanId: results.insertId });
    }
  );
});

// --- DOHVAĆANJE DOKUMENATA ---
app.get('/dokument', authenticateToken, (req, res) => {
  const SIFRA_KORISNIKA_JWT = req.user.id; // Dohvaćamo ID korisnika iz JWT tokena

  const sql = `
    SELECT d.SIFRA_DOKUMENTA, d.cijepiva_ljubimca, d.lijekovi_ljubimca,
           d.putovnica_ljubimca, d.rodovnica_ljubimca, d.SIFRA_LJUBIMCA,
           l.ime_ljubimca
    FROM Dokument d
    JOIN Ljubimac l ON d.SIFRA_LJUBIMCA = l.SIFRA_LJUBIMCA
    WHERE d.SIFRA_KORISNIKA = ?
  `;

  db.query(sql, [SIFRA_KORISNIKA_JWT], (err, results) => {
    if (err) {
      console.error('❌ Greška pri dohvaćanju dokumenata:', err);
      return res.status(500).json({ poruka: '❌ Greška na serveru.' });
    }

    results.forEach(dok => {
      // Konvertiramo Buffer u Base64 prije slanja na frontend (ovo je već postojalo i ispravno je)
      if (Buffer.isBuffer(dok.putovnica_ljubimca)) {
        dok.putovnica_ljubimca = dok.putovnica_ljubimca.toString('base64');
      }
      if (Buffer.isBuffer(dok.rodovnica_ljubimca)) {
        dok.rodovnica_ljubimca = dok.rodovnica_ljubimca.toString('base64');
      }
    });
    res.json(results);
  });
});

// --- UREĐIVANJE DOKUMENATA ---
app.put('/dokument/:id', authenticateToken, upload.fields([{ name: 'putovnica_ljubimca', maxCount: 1 }, { name: 'rodovnica_ljubimca', maxCount: 1 }]), (req, res) => {
  const { id } = req.params;
  const { cijepiva_ljubimca, lijekovi_ljubimca } = req.body;
  const SIFRA_KORISNIKA_JWT = req.user.id;

  let putovnica_ljubimca_buffer = req.files['putovnica_ljubimca'] ? req.files['putovnica_ljubimca'][0].buffer : null;
  let rodovnica_ljubimca_buffer = req.files['rodovnica_ljubimca'] ? req.files['rodovnica_ljubimca'][0].buffer : null;

  // Prvo dohvati postojeće dokumente kako bi se zadržale one datoteke koje nisu poslane
  const fetchSql = `SELECT putovnica_ljubimca, rodovnica_ljubimca FROM Dokument WHERE SIFRA_DOKUMENTA = ? AND SIFRA_KORISNIKA = ?`;
  db.query(fetchSql, [id, SIFRA_KORISNIKA_JWT], (fetchErr, fetchResults) => {
    if (fetchErr) {
      console.error('❌ Greška pri dohvaćanju postojećih dokumenata:', fetchErr);
      return res.status(500).json({ poruka: '❌ Greška na serveru.' });
    }
    if (fetchResults.length === 0) {
      return res.status(404).json({ poruka: 'Dokument nije pronađen ili nemate ovlasti.' });
    }

    const existingDocs = fetchResults[0];

    // BITNA PROMJENA: Konvertirajte nove buffere u Base64 stringove prije spremanja
    let putovnica_to_save = putovnica_ljubimca_buffer ? putovnica_ljubimca_buffer.toString('base64') : null;
    let rodovnica_to_save = rodovnica_ljubimca_buffer ? rodovnica_ljubimca_buffer.toString('base64') : null;

    // Ako nove datoteke nisu poslane, zadržite postojeće
    // Existing data from DB is already in Base64 or null, so just assign.
    putovnica_to_save = putovnica_to_save !== null ? putovnica_to_save : existingDocs.putovnica_ljubimca;
    rodovnica_to_save = rodovnica_to_save !== null ? rodovnica_to_save : existingDocs.rodovnica_ljubimca;


    const sql = `
      UPDATE Dokument
      SET cijepiva_ljubimca = ?, lijekovi_ljubimca = ?,
          putovnica_ljubimca = ?, rodovnica_ljubimca = ?
      WHERE SIFRA_DOKUMENTA = ? AND SIFRA_KORISNIKA = ?
    `;

    const params = [cijepiva_ljubimca, lijekovi_ljubimca, putovnica_to_save, rodovnica_to_save, id, SIFRA_KORISNIKA_JWT];

    db.query(sql, params, (err, result) => {
      if (err) {
        console.error('❌ Greška pri ažuriranju dokumenta:', err);
        return res.status(500).json({ poruka: '❌ Greška na serveru.' });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ poruka: 'Dokument nije pronađen ili nemate ovlasti za njegovo uređivanje.' });
      }

      res.json({ poruka: '✅ Dokument uspješno ažuriran!' });
    });
  });
});

// --- DODAVANJE DOKUMENTA ---
app.post('/dokument', authenticateToken, upload.fields([{ name: 'putovnica_ljubimca', maxCount: 1 }, { name: 'rodovnica_ljubimca', maxCount: 1 }]), (req, res) => {
  const { SIFRA_LJUBIMCA, cijepiva_ljubimca, lijekovi_ljubimca } = req.body;
  const SIFRA_KORISNIKA_JWT = req.user.id;

  const putovnica_ljubimca_buffer = req.files['putovnica_ljubimca'] ? req.files['putovnica_ljubimca'][0].buffer : null;
  const rodovnica_ljubimca_buffer = req.files['rodovnica_ljubimca'] ? req.files['rodovnica_ljubimca'][0].buffer : null;

  // BITNA PROMJENA: Konvertirajte buffere u Base64 stringove prije spremanja
  const putovnica_to_save = putovnica_ljubimca_buffer ? putovnica_ljubimca_buffer.toString('base64') : null;
  const rodovnica_to_save = rodovnica_ljubimca_buffer ? rodovnica_ljubimca_buffer.toString('base64') : null;

  const sql = `
    INSERT INTO Dokument (SIFRA_LJUBIMCA, cijepiva_ljubimca, lijekovi_ljubimca, putovnica_ljubimca, rodovnica_ljubimca, SIFRA_KORISNIKA)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const params = [
    SIFRA_LJUBIMCA || null,
    cijepiva_ljubimca || null,
    lijekovi_ljubimca || null,
    putovnica_to_save, // Sada je Base64 string ili null
    rodovnica_to_save, // Sada je Base64 string ili null
    SIFRA_KORISNIKA_JWT
  ];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('❌ Greška pri dodavanju dokumenta:', err);
      return res.status(500).json({ poruka: '❌ Greška na serveru.' });
    }

    res.status(201).json({ poruka: '✅ Dokument uspješno dodan!', id: result.insertId });
  });
});

// --- BRISANJE DOKUMENATA ---
app.delete('/dokument/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const SIFRA_KORISNIKA_JWT = req.user.id;

  const sql = `
    DELETE FROM Dokument
    WHERE SIFRA_DOKUMENTA = ? AND SIFRA_KORISNIKA = ?
  `;

  db.query(sql, [id, SIFRA_KORISNIKA_JWT], (err, result) => {
    if (err) {
      console.error('❌ Greška pri brisanju dokumenta:', err);
      return res.status(500).json({ poruka: '❌ Greška na serveru.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ poruka: 'Dokument nije pronađen ili nemate ovlasti za njegovo brisanje.' });
    }

    res.json({ poruka: '✅ Dokument uspješno obrisan!' });
  });
});

// ODJAVA
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Greška pri odjavi.' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Uspješno ste se odjavili.' });
  });
});

// SLANJE MAILA
app.post('/sendmail', async (req, res) => {
  const { ime, email, poruka } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'katjablaz55@gmail.com',
      pass: 'fiwj fkgl ipeh hcqr'
    }
  });

  const mailOptions = {
    from: email,
    to: 'katjablaz55@gmail.com',
    subject: `Poruka s kontakt forme`,
    text: `Ime: ${ime}\nEmail: ${email}\nPoruka:\n${poruka}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ message: 'Poruka je poslana.' });
  } catch (error) {
    console.error('Greška pri slanju maila:', error);
    res.status(500).send({ message: 'Greška pri slanju poruke.' });
  }
});

// DOGAĐAJI
app.get('/dogadaji', (req, res) => {
  const query = `
    SELECT 
      naziv_dogadaja,
      vrsta_dogadaja,
      opis_dogadaja,
      grad,
      adresa,
      DATE_FORMAT(datum_dogadaja, '%Y-%m-%d') AS datum_dogadaja,
      TIME_FORMAT(vrijeme_dogadaja, '%H:%i') AS vrijeme_dogadaja,
      SIFRA_DOGADAJA
    FROM Dogadaj
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.post('/dogadaji', (req, res) => {
  db.query('INSERT INTO Dogadaj SET ?', req.body, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Dogadaj dodan', id: result.insertId });
  });
});

app.get('/veterinari', (req, res) => {
  db.query('SELECT * FROM Veterinar', (err, results) => {
    if (err) {
      console.error('❌ Greška u bazi:', err);
      return res.status(500).json({ poruka: 'Greška na serveru', detalji: err.message });
    }
    res.json(results);
  });
});

//ADMINISTRATOR STATS
app.get("/admin/stats", authenticateToken, (req, res) => {
  // Provjera uloge 'admin' nakon autentifikacije
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ poruka: "Nemate dozvolu za pristup kao administrator." });
  }

  const sql = `
    SELECT
      (SELECT COUNT(*) FROM Korisnik) AS korisnici,
      (SELECT COUNT(*) FROM Veterinar) AS veterinari,
      (SELECT COUNT(*) FROM Dogadaj) AS dogadaji
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Greška pri dohvaćanju statistike:", err);
      return res.status(500).json({ poruka: "❌ Greška na serveru." });
    }

    res.json(result[0]);
  });
});


//ADMIN - KORISNICI PRIKAZ
app.get("/admin/korisnici", authenticateToken, async (req, res) => {
  // Provjera uloge 'admin' nakon autentifikacije
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ poruka: "Nemate dozvolu za pristup kao administrator." });
  }

  try {
    const sql = "SELECT SIFRA_KORISNIKA, ime_korisnika, prezime_korisnika, email_korisnika, nadimak_korisnika FROM Korisnik";
    const [korisnici] = await db.promise().query(sql);
    res.json(korisnici);
  } catch (err) {
    console.error("❌ Greška pri dohvaćanju korisnika:", err);
    res.status(500).json({ poruka: "❌ Greška na serveru." });
  }
});


//ADMIN - KORISNICI BRISANJE
app.delete("/admin/korisnici/:id", authenticateToken, async (req, res) => {
  // Provjera uloge 'admin' nakon autentifikacije
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ poruka: "Nemate dozvolu za pristup kao administrator." });
  }

  try {
    // Prvo obriši sve povezane podsjetnike
    await db.promise().query("DELETE FROM Podsjetnik WHERE SIFRA_KORISNIKA = ?", [req.params.id]);

    // Sada možeš sigurno obrisati korisnika
    await db.promise().query("DELETE FROM Korisnik WHERE SIFRA_KORISNIKA = ?", [req.params.id]);

    res.json({ poruka: "Korisnik i svi povezani podsjetnici uspješno obrisani." });
  } catch (err) {
    console.error("❌ Greška pri brisanju korisnika:", err);
    res.status(500).json({ poruka: "❌ Greška na serveru." });
  }
});


//ADMIN - DOGADAJI PRIKAZ
app.get("/admin/dogadaji", authenticateToken, async (req, res) => {
  // Provjera uloge 'admin' nakon autentifikacije
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ poruka: "Nemate dozvolu za pristup kao administrator." });
  }

  const sql = "SELECT * FROM Dogadaj";
  const [dogadaji] = await db.promise().query(sql);
  res.json(dogadaji);
});

//ADMIN - DOGADAJI DODAVANJE
app.post("/admin/dogadaji", authenticateToken, async (req, res) => {
  // Provjera uloge 'admin' nakon autentifikacije
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ poruka: "Nemate dozvolu za pristup kao administrator." });
  }

  console.log("Primljeni podaci:", req.body); // ✅ Debugging log

  const { naziv_dogadaja, vrsta_dogadaja, opis_dogadaja, grad, adresa, datum_dogadaja, vrijeme_dogadaja } = req.body;
  const sql = "INSERT INTO Dogadaj (naziv_dogadaja, vrsta_dogadaja, opis_dogadaja, grad, adresa, datum_dogadaja, vrijeme_dogadaja) VALUES (?, ?, ?, ?, ?, ?, ?)";

  try {
    await db.promise().query(sql, [naziv_dogadaja, vrsta_dogadaja, opis_dogadaja, grad, adresa, datum_dogadaja, vrijeme_dogadaja]);
    res.json({ poruka: "Događaj uspješno dodan." });
  } catch (err) {
    console.error("❌ Greška pri spremanju događaja:", err);
    res.status(500).json({ poruka: "❌ Greška na serveru." });
  }
});


//ADMIN - DOGADAJI UREDIVANJE
app.put("/admin/dogadaji/:id", authenticateToken, async (req, res) => {
  // Provjera uloge 'admin' nakon autentifikacije
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ poruka: "Nemate dozvolu za pristup kao administrator." });
  }

  const sql = "UPDATE Dogadaj SET ? WHERE SIFRA_DOGADAJA = ?";
  await db.promise().query(sql, [req.body, req.params.id]);
  res.json({ poruka: "Događaj uspješno ažuriran." });
});


//ADMIN - DOGADAJI BRISANJE
app.delete("/admin/dogadaji/:id", authenticateToken, async (req, res) => {
  // Provjera uloge 'admin' nakon autentifikacije
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ poruka: "Nemate dozvolu za pristup kao administrator." });
  }

  await db.promise().query("DELETE FROM Dogadaj WHERE SIFRA_DOGADAJA = ?", [req.params.id]);
  res.json({ poruka: "Događaj uspješno obrisan." });
});


//ADMIN - VETERINARI PRIKAZ
app.get("/admin/veterinari", authenticateToken, async (req, res) => {
  // Provjera uloge 'admin' nakon autentifikacije
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ poruka: "Nemate dozvolu za pristup kao administrator." });
  }

  const sql = "SELECT * FROM Veterinar";
  const [veterinari] = await db.promise().query(sql);
  res.json(veterinari);
});


//ADMIN - VETERINARI DODAVANJE
app.post("/admin/veterinari", authenticateToken, async (req, res) => {
  // Provjera uloge 'admin' nakon autentifikacije
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ poruka: "Nemate dozvolu za pristup kao administrator." });
  }

  const sql = "INSERT INTO Veterinar SET ?";
  await db.promise().query(sql, req.body);
  res.json({ poruka: "Veterinar uspješno dodan." });
});


//ADMIN - VETERINARI UREDIVANJE
app.put("/admin/veterinari/:id", authenticateToken, async (req, res) => {
  // Provjera uloge 'admin' nakon autentifikacije
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ poruka: "Nemate dozvolu za pristup kao administrator." });
  }

  const sql = "UPDATE Veterinar SET ? WHERE SIFRA_VETERINARA = ?";
  await db.promise().query(sql, [req.body, req.params.id]);
  res.json({ poruka: "Veterinar uspješno ažuriran." });
});


//ADMIN - VETERINARI BRISANJE
app.delete("/admin/veterinari/:id", authenticateToken, async (req, res) => {
  // Provjera uloge 'admin' nakon autentifikacije
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ poruka: "Nemate dozvolu za pristup kao administrator." });
  }

  await db.promise().query("DELETE FROM Veterinar WHERE SIFRA_VETERINARA = ?", [req.params.id]);
  res.json({ poruka: "Veterinar uspješno obrisan." });
});

// Pokretanje servera

let server; 

if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log("Server radi na portu " + PORT);
  });
}

function closeServer() {
  return new Promise(async (resolve, reject) => { // Koristimo async/await unutar Promise-a
    console.log('--- Pokušavam zatvoriti sve resurse ---');
    
    // 1. Pokušaj zatvoriti HTTP server ako je pokrenut
    if (server) {
      try {
        await new Promise(res => server.close(res));
        console.log('HTTP server zatvoren.');
      } catch (err) {
        console.error('Greška pri zatvaranju HTTP servera:', err);
        // Ne odbijamo odmah, nastavljamo s bazom
      }
    } else {
      console.log('HTTP server nije bio pokrenut (testno okruženje).');
    }

    // 2. Pokušaj zatvoriti DB konekciju ako je aktivna
    if (db && db.state === 'connected') {
      try {
        await new Promise((res, rej) => {
          db.end(err => {
            if (err) return rej(err);
            res();
          });
        });
        console.log('DB konekcija zatvorena.');
      } catch (err) {
        console.error('Greška pri zatvaranju DB konekcije:', err);
        // Ovdje možemo odbiti ili samo logirati, ovisno o željenom ponašanju
        // Za testove, možda je bolje logirati i nastaviti s resolve
      }
    } else {
      console.log('DB konekcija nije aktivna ili ne postoji, preskačem zatvaranje.');
    }

    console.log('Svi resursi zatvoreni (async/await putanja).');
    resolve(); // Razriješi Promise nakon što su svi pokušaji zatvaranja izvršeni
  });
}

module.exports = { app, closeServer, db };
