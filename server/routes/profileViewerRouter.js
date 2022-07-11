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
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env['REFRESH_TOKEN'];

const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client,
});

function isLoggedIn(req, res, next) {
    req.user ? next() : res.redirect('/auth/google'); //UNATHORIZED STATUS
}

router.get('', isLoggedIn, async(req, res) => {
    const toView = await profileModel.findOne({ mail: req.query.view });
    res.render('./profileViewer', { user: toView });
});

module.exports = router;