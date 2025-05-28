const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS
app.use(cors({
  origin: 'http://localhost:9000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Session middleware
app.use(session({
  secret: 'tajna_lozinka_za_session',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 60 * 60 * 1000
  }
}));

app.use(cookieParser());

// Povezivanje s bazom
const db = mysql.createConnection({
  host: 'ucka.veleri.hr',
  user: 'kblazevic',
  password: '11',
  database: 'kblazevic'
});

db.connect(err => {
  if (err) {
    console.error('Greška prilikom povezivanja s bazom:', err);
  } else {
    console.log('Povezano s bazom podataka.');
  }
});

// Middleware za autentikaciju
function authenticateSession(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'Niste prijavljeni.' });
  }
}

// REGISTRACIJA (1. KORAK REGISTRACIJE)
app.post('/registracija', (req, res) => {
  const { ime, prezime, email, lozinka } = req.body;
  console.log('Primljeno u /registracija:', req.body);

  if (!ime || !prezime || !email || !lozinka) {
    return res.status(400).json({ message: 'Sva polja su obavezna.' });
  }

  const sql = `
    INSERT INTO Korisnik (ime_korisnika, prezime_korisnika, email_korisnika, lozinka_korisnika)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [ime, prezime, email, lozinka], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Email je već registriran.' });
      }
      console.error('Greška prilikom unosa:', err);
      return res.status(500).json({ message: 'Greška u bazi podataka.' });
    }

    // Dohvati korisnika nakon uspješne registracije
    db.query(`SELECT * FROM Korisnik WHERE email_korisnika = ?`, [email], (err, results) => {
      if (err || results.length === 0) {
        return res.status(500).json({ message: 'Greška prilikom dohvaćanja korisnika.' });
      }

      const user = results[0];

      // Automatsko postavljanje sesije
      req.session.user = {
        id: user.SIFRA_KORISNIKA,
        email: user.email_korisnika,
        uloga: user.uloga_korisnika,
        ime: user.ime_korisnika,
        prezime: user.prezime_korisnika
      };

      res.json({ message: 'Registracija uspješna. Korisnik je prijavljen. Nastavi s izradom profila', user: req.session.user });
    });
  });
});


// IZRADA PROFILA (2. KORAK REGISTRACIJE)
app.put('/izrada-profila', (req, res) => {
  const {
    email,
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
    WHERE email_korisnika = ?
  `;

  db.query(sql, [nadimak, adresa, mjesto, datumRodenja, brojTelefona, email], (err, result) => {
    if (err) {
      console.error('Greška prilikom ažuriranja korisnika:', err);
      return res.status(500).json({ error: 'Greška u bazi podataka' });
    }
    res.json({ message: 'Profil ažuriran' });
  });
});

//IZRADA PROFILA ZA LJUBIMCA (3. KORAK REGISTRACIJE)
app.post('/ljubimci', async (req, res) => {
  const { ime_ljubimca, vrsta_ljubimca, datum_rodenja_ljubimca, kilaza_ljubimca, podaci_o_njezi_ljubimca, podaci_o_prehrani_ljubimca, SIFRA_KORISNIKA } = req.body;

  if (!SIFRA_KORISNIKA) {
    return res.status(400).json({ poruka: 'Greška: SIFRA_KORISNIKA je obavezna.' });
  }

  try {
    const sql = `
      INSERT INTO Ljubimac (ime_ljubimca, vrsta_ljubimca, datum_rodenja_ljubimca, kilaza_ljubimca, podaci_o_njezi_ljubimca, podaci_o_prehrani_ljubimca, SIFRA_KORISNIKA) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.promise().query(sql, [
      ime_ljubimca,
      vrsta_ljubimca,
      datum_rodenja_ljubimca,
      kilaza_ljubimca,
      podaci_o_njezi_ljubimca,
      podaci_o_prehrani_ljubimca,
      SIFRA_KORISNIKA
    ]);

    res.status(201).json({ poruka: 'Ljubimac je uspješno dodan.', id: result.insertId });
  } catch (err) {
    console.error('Greška u SQL query-u:', err.message);
    res.status(500).json({ poruka: 'Greška na serveru.', detalji: err.message });
  }
});

// PRIJAVA
app.post('/prijava', (req, res) => {
  const { username, lozinka } = req.body;

  if (!username || !lozinka) {
    return res.status(400).json({ message: 'Email/nadimak i lozinka su obavezni.' });
  }

  const sql = `
    SELECT * FROM Korisnik
    WHERE (email_korisnika = ? OR nadimak_korisnika = ?) AND lozinka_korisnika = ?
  `;

  db.query(sql, [username, username, lozinka], (err, results) => {
    if (err) {
      console.error('Greška u bazi:', err);
      return res.status(500).json({ message: 'Greška na serveru.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Neispravan email/nadimak ili lozinka.' });
    }

    const user = results[0];
    req.session.user = {
      id: user.SIFRA_KORISNIKA,
      email: user.email_korisnika,
      uloga: user.uloga_korisnika,
      ime: user.ime_korisnika,
      prezime: user.prezime_korisnika
    };

    res.json({ message: 'Uspješna prijava', user: req.session.user });
  });
});

// PROVJERA SESIJE
app.get('/api/check-session', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.json({ authenticated: false });
  }
});

//DOHVAĆANJE PROFILA
app.get('/profile', authenticateSession, (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Korisnik nije prijavljen.' });
  }

  const { ime, prezime, id } = req.session.user;

  // Promjena: Sada koristimo ispravan naziv `SIFRA_KORISNIKA`
  req.session.user.SIFRA_KORISNIKA = id;

  res.json({
    SIFRA_KORISNIKA: req.session.user.SIFRA_KORISNIKA,
    ime,
    prezime
  });
});


//AŽURIRANJE PROFILA
app.put('/update-profile', (req, res) => {
  const korisnikId = req.session?.user?.id;
  if (!korisnikId) return res.status(401).json({ error: "Korisnik nije prijavljen." });

  const fieldsToUpdate = { ime_korisnika: req.body.ime, prezime_korisnika: req.body.prezime, email_korisnika: req.body.email };
  const updates = Object.entries(fieldsToUpdate).filter(([_, value]) => value);

  if (!updates.length) return res.status(400).json({ error: "Nema podataka za ažuriranje." });

  const sqlUpdate = `UPDATE Korisnik SET ${updates.map(([key]) => `${key} = ?`).join(', ')} WHERE SIFRA_KORISNIKA = ?`;
  db.query(sqlUpdate, [...updates.map(([_, value]) => value), korisnikId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Greška prilikom ažuriranja profila' });

    db.query(`SELECT ime_korisnika AS ime, prezime_korisnika AS prezime FROM Korisnik WHERE SIFRA_KORISNIKA = ?`, [korisnikId], (err2, rows) => {
      if (err2) return res.status(500).json({ error: 'Greška prilikom dohvata podataka' });
      res.json({ message: 'Profil uspješno ažuriran', user: rows[0] });
    });
  });
});


// DOHVATI LJUBIMCE KORISNIKA
app.get('/moji-ljubimci', (req, res) => {

  if (!req.session.user || !req.session.user.SIFRA_KORISNIKA) {
    return res.status(401).json({ poruka: 'Korisnik nije prijavljen.' });
  }

  const sql = `SELECT * FROM Ljubimac WHERE SIFRA_KORISNIKA = ?`;

  db.query(sql, [req.session.user.SIFRA_KORISNIKA], (err, results) => {
    if (err) {
      console.error('Greška pri dohvaćanju ljubimaca:', err);
      return res.status(500).json({ poruka: 'Greška na serveru.', detalji: err.message });
    }

    res.json(results);
  });
});

//UREDI POSTOJEĆEG LJUBIMCA
app.put('/uredi-ljubimca/:id', (req, res) => {
  const SIFRA_LJUBIMCA = req.params.id;
  const { ime_ljubimca, vrsta_ljubimca, datum_rodenja_ljubimca, kilaza_ljubimca, podaci_o_njezi_ljubimca, podaci_o_prehrani_ljubimca } = req.body;

  if (!SIFRA_LJUBIMCA) {
    return res.status(400).json({ poruka: 'Greška: ID ljubimca je obavezan!' });
  }

  // 🔎 Dohvati trenutne podatke ljubimca prije ažuriranja
  const fetchSql = `SELECT * FROM Ljubimac WHERE SIFRA_LJUBIMCA = ?`;
  db.query(fetchSql, [SIFRA_LJUBIMCA], (err, results) => {
    if (err) {
      console.error('Greška pri dohvaćanju postojećeg ljubimca:', err);
      return res.status(500).json({ poruka: 'Greška na serveru.', detalji: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ poruka: 'Ljubimac nije pronađen.' });
    }

    // Zadrži stare vrijednosti za nepromijenjena polja
    const ljubimac = results[0];
    const updatedLjubimac = {
      ime_ljubimca: ime_ljubimca || ljubimac.ime_ljubimca,
      vrsta_ljubimca: vrsta_ljubimca || ljubimac.vrsta_ljubimca,
      datum_rodenja_ljubimca: datum_rodenja_ljubimca || ljubimac.datum_rodenja_ljubimca,
      kilaza_ljubimca: kilaza_ljubimca || ljubimac.kilaza_ljubimca,
      podaci_o_njezi_ljubimca: podaci_o_njezi_ljubimca || ljubimac.podaci_o_njezi_ljubimca,
      podaci_o_prehrani_ljubimca: podaci_o_prehrani_ljubimca || ljubimac.podaci_o_prehrani_ljubimca
    };

    // Ažuriraj samo ono što je promijenjeno
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

      res.json({ poruka: '✅ Ljubimac uspješno ažuriran.', ljubimac: updatedLjubimac });
    });
  });
});

//OBRIŠI POSTOJEĆEG LJUBIMCA
app.delete('/obrisi-ljubimca/:id', (req, res) => {
  const SIFRA_LJUBIMCA = req.params.id;

  if (!SIFRA_LJUBIMCA) {
    return res.status(400).json({ poruka: '❌ Greška: ID ljubimca je obavezan!' });
  }

  const sql = `DELETE FROM Ljubimac WHERE SIFRA_LJUBIMCA = ?`;

  db.query(sql, [SIFRA_LJUBIMCA], (err, result) => {
    if (err) {
      console.error('❌ Greška pri brisanju ljubimca:', err);
      return res.status(500).json({ poruka: '❌ Greška na serveru.', detalji: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ poruka: '❌ Ljubimac nije pronađen.' });
    }

    res.json({ poruka: '✅ Ljubimac uspješno obrisan.' });
  });
});

//DOHVAĆANJE SLIKA IZ BAZE
app.get('/galerija', (req, res) => {
  if (!req.session.user || !req.session.user.SIFRA_KORISNIKA) {
    return res.status(401).json({ poruka: '❌ Korisnik nije prijavljen.' });
  }

  const sql = `
    SELECT SIFRA_SLIKE, naziv_slike, opis_slike, DATE_FORMAT(datum_objave, '%d.%m.%Y.') AS datum_objave, slika
    FROM Slike
    WHERE SIFRA_KORISNIKA = ? 
    ORDER BY datum_objave DESC
  `;

  db.query(sql, [req.session.user.SIFRA_KORISNIKA], (err, results) => {
    if (err) {
      console.error('❌ Greška pri dohvaćanju galerije:', err);
      return res.status(500).json({ poruka: '❌ Greška na serveru.', detalji: err.message });
    }

    res.json(results.map(slika => ({
      SIFRA_SLIKE: slika.SIFRA_SLIKE,
      naziv_slike: slika.naziv_slike,
      opis_slike: slika.opis_slike,
      datum_objave: slika.datum_objave, // Sada je formatiran na backendu
      slika: slika.slika ? `data:image/jpeg;base64,${Buffer.from(slika.slika).toString('base64')}` : null
    })));
  });
});


//DODAVANJE SLIKA U BAZU
app.post('/dodaj-sliku', upload.single('slika'), async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ poruka: '❌ Korisnik nije prijavljen.' });
  }

  // 🎯 Osiguravamo ispravan naziv `SIFRA_KORISNIKA`
  req.session.user.SIFRA_KORISNIKA = req.session.user.id;

  const { naziv_slike, opis_slike } = req.body;
  const slikaBuffer = req.file.buffer;

  // ✅ Formatiranje datuma u `DD.MM.YYYY.` direktno u SQL upitu
  const sql = `
    INSERT INTO Slike (SIFRA_KORISNIKA, slika, naziv_slike, opis_slike, datum_objave) 
    VALUES (?, ?, ?, ?, CURDATE())
  `;

  db.query(sql, [req.session.user.SIFRA_KORISNIKA, slikaBuffer, naziv_slike, opis_slike], (err, result) => {
    if (err) {
      console.error('❌ Greška pri dodavanju slike:', err);
      return res.status(500).json({ poruka: '❌ Greška na serveru.', detalji: err.message });
    }

    res.json({ poruka: '✅ Slika uspješno dodana!', SIFRA_SLIKE: result.insertId });
  });
});

//PREGLED POJEDINACNE SLIKE
app.get('/slika/:SIFRA_SLIKE', (req, res) => {
  const slikaId = req.params.SIFRA_SLIKE;

  const sql = `
    SELECT SIFRA_SLIKE, naziv_slike, opis_slike, DATE_FORMAT(datum_objave, '%d.%m.%Y.') AS datum_objave, slika
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

    const slika = results[0].slika 
      ? `data:image/jpeg;base64,${Buffer.from(results[0].slika).toString('base64')}` 
      : null;

    res.json({
      SIFRA_SLIKE: results[0].SIFRA_SLIKE,
      naziv_slike: results[0].naziv_slike,
      opis_slike: results[0].opis_slike,
      datum_objave: results[0].datum_objave,
      slika
    });
  });
});

//UREDIVANJE SLIKE
app.put('/slika/:SIFRA_SLIKE', (req, res) => {
  const slikaId = req.params.SIFRA_SLIKE;
  const { naziv_slike, opis_slike } = req.body; // Datum NE šaljemo!

  let sql = 'UPDATE Slike SET ';
  const fields = [];
  const values = [];

  if (naziv_slike) {
    fields.push('naziv_slike = ?');
    values.push(naziv_slike);
  }
  if (opis_slike) {
    fields.push('opis_slike = ?');
    values.push(opis_slike);
  }

  if (fields.length === 0) {
    return res.status(400).json({ poruka: '❌ Nema podataka za ažuriranje.' });
  }

  sql += fields.join(', ') + ' WHERE SIFRA_SLIKE = ?';
  values.push(slikaId);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Greška pri ažuriranju slike:', err);
      return res.status(500).json({ poruka: '❌ Greška na serveru.', detalji: err.message });
    }

    res.json({ poruka: '✅ Slika uspješno ažurirana!' });
  });
}); 

//BRISANJE SLIKE  
app.delete('/slika/:SIFRA_SLIKE', (req, res) => {
  const slikaId = req.params.SIFRA_SLIKE;

  const sql = 'DELETE FROM Slike WHERE SIFRA_SLIKE = ?';
  db.query(sql, [slikaId], (err, result) => {
    if (err) {
      console.error('❌ Greška pri brisanju slike:', err);
      return res.status(500).json({ poruka: '❌ Greška na serveru.', detalji: err.message });
    }

    res.json({ poruka: '🗑️ Slika uspješno obrisana!' });
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

// VETERINARI
app.get('/veterinari', (req, res) => {
  db.query('SELECT * FROM Veterinar', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Pokretanje servera

let server;

if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log("Server radi na portu " + PORT);
  });
}

function closeServer() {
  return new Promise((resolve, reject) => {
    if (server) {
      server.close(err => {
        if (err) return reject(err);

        // Zatvaranje konekcije prema bazi
        db.end(err => {
          if (err) return reject(err);
          resolve();
        });
      });
    } else {
      resolve();
    }
  });
}

module.exports = { app, closeServer };

