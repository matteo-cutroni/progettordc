//DEPENDENCIES
const express=require('express');
const mongoose = require("mongoose");

//ROUTER CHE BISOGNA ESPORTARE
const router=express.Router();

const Queue = require("../models/queue");

//ATTIVA IL PUBLIC
router.use(express.static(__dirname + '/../public'));

function isLoggedIn(req,res,next){
    req.user ? next():res.redirect('/auth/google'); //UNATHORIZED STATUS
}

router.get('',isLoggedIn,async (req,res)=>{
    console.log(req.session);
    const mieQueue = await Queue.find({'nome': {$regex : req.user.mail}})
    res.render('./allChats', {queue:mieQueue, user: req.user})
})

module.exports = router;