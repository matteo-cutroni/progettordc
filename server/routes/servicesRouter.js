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

router.get('/', isLoggedIn, async (req,res)=>{
    if (req.user.ruolo=="datore"){
        res.render("./datoreService",{user:req.user});
    }
    else if (req.user.ruolo=="lavoratore"){
        const mieiAnnunci=await Annuncio.find({mail:{$ne: req.user.mail}});
        res.render("./lavoratoreService",{user:req.user,annunci:mieiAnnunci});
    }
    else{
        // ... DA AGGIUNGERE CON GET L'AVVISO ALL'UTENTE ...
        res.redirect('/profile');
    }
});

router.get('/miei-annunci', isLoggedIn, async(req,res)=>{
    if (req.user.ruolo=="datore"){
        const mieiAnnunci=await Annuncio.find({mail:req.user.mail});
        res.render("./mieiAnnunci",{user:req.user, annunci:mieiAnnunci});
    }
    else{
        res.redirect('/');
    }
});

router.post('/delete',isLoggedIn,async(req,res)=>{
    const toDelete= await Annuncio.findOne({mail:req.user.mail,_id:req.body.id});
    
    if (toDelete.mail==req.user.mail){
        console.log("CANCELLO ANNUNCIO: " + req.body.id);
        await Annuncio.deleteOne({_id:req.body.id});
    }
    res.redirect('/services/miei-annunci');
});

router.post('/publish' , isLoggedIn, async (req,res)=>{
    console.log("\nPublishing annuncio...\n");
    console.log("lavoroOfferto: "+ req.body.lavoroProposto);
    console.log("requisiti: " + req.body.requisiti)

    const annuncioData={
        mail: req.user.mail,
        azienda: req.user.azienda,
        picture: req.user.picture,
        lavoro: req.body.lavoroProposto,
        requisiti: req.body.requisiti,
        date: Date.now()
    }

    let result = await Annuncio.create(annuncioData);
    console.log("\nNuovo annuncio caricato nel database\n");
    console.log("\nRisultato: " + result);

    res.redirect('/services');
});


module.exports=router;