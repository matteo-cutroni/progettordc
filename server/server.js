const express = require('express');

require('dotenv').config({ path: __dirname + '/.env' });

const session = require('express-session');

const servicesRouter = require('./routes/servicesRouter');
const profileRouter = require('./routes/profileRouter');
const profileViewerRouter = require('./routes/profileViewerRouter');
const chatRouter = require('./routes/chatRouter');
const allChatsRouter = require('./routes/allChatsRouter');
const apiRouter = require('./routes/apiRouter');
const passport = require('passport');
const { default: mongoose } = require('mongoose');
const MongoStore = require('connect-mongo');
const INSTANCE = process.env.INSTANCE;



//REQUIRE DELLA GOOGLE STRATEGY
require('./auth/auth');



const SESSION_OPTIONS = {
    cookie: {
        /* cookie's lifetime: 4h */
        maxAge: 1000 * 60 * 60 * 4,
        secure: false,
    },
    resave: false,
    saveUninitialized: true,
    secret: "some_value",
    store: MongoStore.create({ mongoUrl: 'mongodb://mongo:27017/new_db' }),
};


const app = express();

//MIDDLEWARE for EXPRESS-SESSION
app.use(session(SESSION_OPTIONS));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//SET STATIC FILES
app.use(express.static(__dirname + '/public'));

app.engine('html', require('ejs').renderFile);

//ROUTES
app.use('/services', servicesRouter);
app.use('/profile', profileRouter);
app.use('/profileViewer', profileViewerRouter);
app.use('/chat', chatRouter);
app.use('/allChats', allChatsRouter);
app.use('/api', apiRouter);

//MIDDLEWARE
app.set('view engine', 'ejs');

function isLoggedIn(req, res, next) {
    req.user ? next() : res.redirect('/auth/google'); //UNATHORIZED STATUS
}

//GETs
app.get('/', (req, res) => {
    res.render('./index', { user: req.user });
});

app.get('/aboutus', (req, res) => {
    res.render('./aboutus', { user: req.user });
});

app.use(function(req, res, next) {
    res.locals.login = req.isAuthenticated();
    res.locals.user = req.user;
    next();
});

//AUTENTICAZIONE GOOGLE
app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['email', 'profile',
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/drive.file"
        ],
        accessType: 'offline',
        approvalPrompt: 'force' 
    }) //LO SCOPE SERVE AD OTTENERE DEI DATI
);

//GOOGLE CALLBACK (ALLA FINE DELLA REGISTRAZIONE)
app.get('/google/callback',
    passport.authenticate('google', {
        successRedirect: 'https://localhost:8083',
        failureRedirect: '/auth/failure'
    })
);

app.get('/auth/failure', (req, res) => {
    res.send("Something went wrong, we're sorry.");
});

app.get('/protected', isLoggedIn, (req, res) => {
    res.send('Protected Zone');
});

app.get("/auth/logout", (req, res, next) => {
    req.logout(req.user, err => {
        if (err) return next(err);
        res.redirect("/");
    });
});

//APIDOC 

app.use(express.static(__dirname + '/public/doc'));

app.get("/apidoc", (req, res, next) => {
    res.render('../public/doc/index.html');
});


mongoose
    .connect('mongodb://mongo:27017/new_db')
    .then((result) => {
        console.log(`${INSTANCE} -> ${result.connection.host}`);
        app.listen(3000, () => console.log('Listening on port 3000...'));
    });
5