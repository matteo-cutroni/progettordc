//DEPENDENCIES
const express=require('express');
const mongoose = require("mongoose");

//ROUTER CHE BISOGNA ESPORTARE
const router=express.Router();

const Queue = require("../models/queue");

//ATTIVA IL PUBLIC
router.use(express.static(__dirname + '/../public'));

router.get('',async (req,res)=>{
    const mieQueue = await Queue.find({'nome': {$regex : req.user.mail}})
    res.render('./allChats', {queue:mieQueue, user: req.user})
})

module.exports = router;