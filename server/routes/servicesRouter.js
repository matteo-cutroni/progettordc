//DEPENDENCIES
const express=require('express');
const mongoose = require("mongoose");

//ROUTER CHE BISOGNA ESPORTARE
const router=express.Router();

const Annuncio = require("../models/annuncio");

//ATTIVA IL PUBLIC
router.use(express.static(__dirname + '/../public'));

function isLoggedIn(req,res,next){
    req.user ? next():res.redirect('/auth/google'); //UNATHORIZED STATUS
}

router.get('/', isLoggedIn, (req,res)=>{
    if (req.user.ruolo=="datore"){
        res.render("./datoreService",{user:req.user});
    }
    else if (req.user.ruolo=="lavoratore"){
        res.send("lavoratore");
    }
    else{
        // ... DA AGGIUNGERE CON GET L'AVVISO ALL'UTENTE ...
        res.redirect('/profile');
    }
});

router.get('/miei-annunci', isLoggedIn, async(req,res)=>{
    if (req.user.ruolo=="datore"){
        const mieiAnnunci=await Annuncio.find({googleId: req.user.googleId});
        res.render("./mieiAnnunci",{user:req.user, annunci:mieiAnnunci});
    }
    else{
        res.redirect('/');
    }
});

router.post('/publish' , isLoggedIn, async (req,res)=>{
    console.log("\nPublishing annuncio...\n");
    console.log("lavoroOfferto: "+ req.body.lavoroProposto);
    console.log("requisiti: " + req.body.requisiti)

    const annuncioData={
        googleId: req.user.googleId,
        azienda: req.user.azienda,
        picture: req.user.picture,
        lavoro: req.body.lavoroProposto,
        requisiti: req.body.requisiti,
        date: Date.now()
    }

    let result = await Annuncio.create(annuncioData);
    console.log("\nNuovo annuncio caricato nel database\n");
    console.log("\nRisultato: " + result);

    res.redirect('/');
});


module.exports=router;