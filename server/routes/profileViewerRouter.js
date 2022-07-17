//DEPENDENCIES
const stream = require('stream');
const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const mongoose = require("mongoose");
var bodyParser = require('body-parser');

//ROUTER CHE BISOGNA ESPORTARE
const router = express.Router();
const upload = multer();

//profileModel
const profileModel = require("../models/profile")

//SET STATIC FILES
router.use(express.static(__dirname + '/../public/'));

//GOOGLEAPIs
const GOOGLE_CLIENT_ID = process.env['GOOGLE_CLIENT_ID'];
const GOOGLE_CLIENT_SECRET = process.env['GOOGLE_CLIENT_SECRET'];

function isLoggedIn(req, res, next) {
    req.user ? next() : res.redirect('/auth/google'); //UNATHORIZED STATUS
}

router.get('', isLoggedIn, async(req, res) => {
    const toView = await profileModel.findOne({ mail: req.query.view });
    res.render('./profileViewer', { user: toView });
});

module.exports = router;