const express=require('express');

require('dotenv').config({path: __dirname + '/.env'});


const passport=require('passport');
const { default: mongoose } = require('mongoose');
const MongoStore = require('connect-mongo');

//REQUIRE DELLA GOOGLE STRATEGY
require('./auth/auth');

function isLoggedIn(req,res,next){
    req.user ? next():res.redirect('/auth/google'); //UNATHORIZED STATUS
}