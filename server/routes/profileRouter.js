//DEPENDENCIES
const stream = require('stream');
const express=require('express');
const multer = require('multer');
const { google } = require('googleapis');
const mongoose = require("mongoose");
var bodyParser = require ('body-parser');

//ROUTER CHE BISOGNA ESPORTARE
const router=express.Router();
const upload=multer();

//profileModel
const profileModel = require("../models/profile")

//SET STATIC FILES
router.use(express.static(__dirname + '/../public/'));

//GOOGLEAPIs
const GOOGLE_CLIENT_ID= process.env['GOOGLE_CLIENT_ID'];
const GOOGLE_CLIENT_SECRET= process.env['GOOGLE_CLIENT_SECRET'];
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN=process.env['REFRESH_TOKEN'];

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

function isLoggedIn(req,res,next){
    req.user ? next():res.redirect('/auth/google'); //UNATHORIZED STATUS
}

router.get('',isLoggedIn,(req,res)=>{
    console.log("\n\n session user = " + req.user);
    res.render('./profile',{user: req.user});
});

router.get('/edit',isLoggedIn,(req,res)=>{
    console.log("\n\n session user = " + req.user);
    res.render('./profileEdit',{user: req.user});
});

//MODIFICA PROFILO

//FUNZIONE PER UPLOAD SUL DRIVE
const uploadFile= async (fileObject)=>{
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileObject.buffer);

    try {
      const response = await drive.files.create({
        media: {
            mimeType: fileObject.mimeType,
            body: bufferStream,
        },
        requestBody: {
            name: 'Jobify Curriculum',
            mimeType: fileObject.mimeType,
        }
      });
      return response;
    } catch (error) {
      console.log(error.message);
    }
}

//MODIFICA PROFILO

router.post("/set", upload.any(), async (req,res)=>{
    var query={'mail': req.user.mail};

    try{
        const { body, files } = req;

        const response=await uploadFile(files[0]);
        console.log(response.data);
        await profileModel.updateOne(query, {$set:{
                //DATI BACK-END
                name:req.user.name.givenName,
                surname:req.user.name.familyName,
                mail:req.user.mail,
                //DATI FRONT-END
                ruolo: req.body.ruolo,
                azienda:req.body.azienda}
        }, {upsert: true});
        
    } catch(f){
        console.log("WHAT");
        console.log(f.message);
    }
    res.redirect('/profile');
});    

module.exports=router;