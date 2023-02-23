const express = require('express');
const cookieParser = require("cookie-parser");
const sqlite3 = require('sqlite3');
const sessions = require('express-session');
const e = require('express');

const db = new sqlite3.Database('biuro_dane.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});


const app = express();
const port = 3000;
const oneHour = 1000 * 3600

app.use(express.static('views'));
app.use(cookieParser());
app.use(express.urlencoded({extended: true}))

app.use(sessions({
    secret:"donotlookatthisitssecret",
    saveUninitialized:true,
    cookie: { maxAge: oneHour },
    resave: false
}))

app.use(express.static('views'));
app.use(cookieParser());
app.use(express.urlencoded({extended: true}))

app.use(sessions({
    secret:"donotlookatthisitssecret",
    saveUninitialized:true,
    cookie: { maxAge: oneHour },
    resave: false
}))

var session;

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    session=req.session;
    if(session.userid){
        res.render('index _log.ejs');
    }
    else{
        res.render('index.ejs');
    }
});

app.get('/logout', (req,res) => {
    req.session.destroy();
    res.redirect('/')
})

app.get('/reg_log', (req, res) => {
    res.render('reg_log.ejs');
});

app.post('/log', (req, res) => {
    let email = req.body.email_log;
    let password = req.body.password_log;

    console.log(email);
    console.log(password);

    db.get(`SELECT * FROM Uzytkownicy WHERE Email = ? AND Haslo = ?`, [email, password], (err, row) => {
        if (err) {
            console.log(err);
        } else {
            if (row) {
                console.log('Zalogowano');
                session=req.session;
                console.log("Email = " , email)
                session.userid=email;
                console.log(req.session)
                res.redirect('/dash');
            } else {
                console.log('Niepoprawne dane');
                res.redirect('/reg_log');
            }
        }
    });
});

app.post('/reg', (req, res) => {

    let email = req.body.email;
    let password = req.body.password;
    let password2 = req.body.passwordRep;
    let imie = req.body.first_name;
    let nazwisko = req.body.last_name;

    console.log(email);
    console.log(password);
    console.log(password2);
    console.log(imie);
    console.log(nazwisko);

    db.get(`SELECT * FROM Uzytkownicy WHERE Email = ?`, [email], (err, row) => {
        if (err) {
            console.log(err);
        } else {
            if (row) {
                console.log('Uzytkownik istnieje');
                res.redirect('/reg_log');
            } else {
                if (password == password2) {
                    db.run(`INSERT INTO Uzytkownicy VALUES (?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0, 0, 0)`, [email, password, imie, nazwisko], function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Dodano uzytkownika');
                            session=req.session;
                            console.log(email)
                            session.userid=email;
                            console.log(req.session)
                            res.redirect('/reg_log');
                        }
                    });
                } else {
                    console.log('Hasla nie sa takie same');
                    res.redirect('/reg_log');
                }
            }
        }
    });
});

app.get('/dash', (req, res) => {
    session=req.session;
    if(session.userid){
        db.get(`SELECT * FROM Uzytkownicy WHERE Email = ?`, [session.userid], (err, row) => {
            if(row){
                console.log(row)
                console.log(row.Admin)
                if(row.Admin == 1)
                {
                    res.render('dash_admin.ejs',{imie: row.Imie , email:row.Email , nazwisko: row.Nazwisko , miasto: row.Miasto , ulica: row.Ulica , dom: row.NumerDomu })
                }
                else
                {
                res.render('dash.ejs',{imie: row.Imie , email:row.Email , nazwisko: row.Nazwisko , miasto: row.Miasto , ulica: row.Ulica , dom: row.NumerDomu })    
                }
            }
            else{
                console.log(err)
                res.render('dash.ejs')
            }
        })
    };
});

app.get('/book', (req, res) => {
    res.render('book.ejs');
});

app.get('/book_guest', (req, res) => {
    res.render('book_guest.ejs');
});

app.get('/personal_data_form', (req, res) => {
    res.render('personal_data_form.ejs');
});

app.post("/personal_data_form", (req, res) => {

    session=req.session;
    let imie = req.body.first_name;
    let nazwisko = req.body.last_name;
    let miasto = req.body.miasto;
    let ulica = req.body.ulica;
    let nr_domu = req.body.nr_domu;

    console.log(imie);
    console.log(nazwisko);
    console.log(miasto);
    console.log(ulica);
    console.log(nr_domu);

    db.run(`UPDATE Uzytkownicy SET Imie = ?, Nazwisko = ?, Miasto = ?, Ulica = ?, NumerDomu = ? WHERE Email = ?`, [imie, nazwisko, miasto, ulica, nr_domu, session.userid], function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log('Zaktualizowano dane');
            console.log(`Row(s) updated: ${this.changes}`);
            res.redirect('/');
        }
    });

});

app.get('/details', (req, res) => {
    res.render('details.ejs');
});

app.post('/dash' , (req , res) => {
    let kraj = req.body.kraj;
    let miasto = req.body.miasto;
    let dlimit = req.body.dlimit;
    let glimit = req.body.glimit;
    let cena = req.body.cena;
    let dl = req.body.dl;
    db.run(`INSERT INTO Wycieczki VALUES (NULL , 2023/10/14 , ? , ? , ? , ? , ? , ? , 0 , 0 , 1 ,0 )`, [kraj , miasto , dlimit , glimit , cena , dl], function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Dodano wycieczke")
            res.redirect('/dash');
        }
    });
});


app.listen(port);