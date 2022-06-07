const express=require('express');

require('dotenv').config({path: __dirname + '/.env'});

const session=require('express-session');

const servicesRouter=require('./routes/servicesRouter');
const profileRouter=require('./routes/profileRouter');
const passport=require('passport');

//REQUIRE DELLA GOOGLE STRATEGY
require('./auth/auth');

function isLoggedIn(req,res,next){
    req.user ? next():res.redirect('/auth/google'); //UNATHORIZED STATUS
}

const app=express();

//MIDDLEWARE for EXPRESS-SESSION
app.use(session({secret:'cats'}));
app.use(passport.initialize());
app.use(passport.session());

//SET STATIC FILES
app.use(express.static(__dirname + '/public'));

//ROUTES
app.use('/services',servicesRouter);
app.use('/profile',profileRouter);

//GETTING login URL
//MIDDLE WARE CHE USA EJS
app.set('view engine','ejs');

app.get('/',(req,res)=>{
    res.render('./index',{user: req.user});
});


app.get('/aboutus',(req,res)=>{
    res.render('./aboutus',{user: req.user});
});

app.use(function(req,res,next){ 
    res.locals.login = req.isAuthenticated(); 
    res.locals.user = req.user; 
    next(); 
});

//AUTENTICAZIONE GOOGLE
app.get('/auth/google',
    passport.authenticate('google',{ scope: ['email','profile'] } ) //LO SCOPE SERVE AD OTTENERE DEI DATI
);

//GOOGLE CALLBACK (ALLA FINE DELLA REGISTRAZIONE)
app.get('/google/callback',
    passport.authenticate('google',{
        successRedirect:'/',
        failureRedirect: '/auth/failure'
    })
);

app.get('/auth/failure',(req,res)=>{
    res.send("Something went wrong, we're sorry.");
});

app.get('/protected', isLoggedIn, (req,res)=>{
    res.send('Protected Zone');
});

app.get("/auth/logout", (req, res, next) => {
    req.logout(req.user, err => {
      if(err) return next(err);
      res.redirect("/");
    });
});

app.listen(3000,()=>console.log('Listening on port 3000...'));