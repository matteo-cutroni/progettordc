//DEPENDENCIES
const express=require('express');

//ROUTER CHE BISOGNA ESPORTARE
const router=express.Router();

const mongoose = require("mongoose")
//profileModel
const profileModel = require("../models/profile")

//ATTIVA IL PUBLIC
router.use(express.static(__dirname + '/../public'));

//PER LEGGERE I POST DATA
router.use(express.urlencoded({extended:false}));

function isLoggedIn(req,res,next){
    req.user ? next():res.redirect('/auth/google'); //UNATHORIZED STATUS
}

router.post("/profile", isLoggedIn, async (req,res)=>{
    var query={'mail': req.user.mail};

    await profileModel.updateOne(query, {$set:{
            //DATI BACK-END
            name:req.user.name.givenName,
            surname:req.user.name.familyName,
            mail:req.user.mail,
            //DATI FRONT-END
            ruolo: req.body.ruolo,
            azienda:req.body.azienda}
        }, {upsert: true});

    res.redirect('/profile');
});    

module.exports=router;