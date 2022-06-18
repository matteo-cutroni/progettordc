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
    res.render('./profile',{user: req.user});
});

router.get('/edit',isLoggedIn,(req,res)=>{
    res.render('./profileEdit',{user: req.user});
});

//MODIFICA PROFILO

//FUNZIONE PER UPLOAD SUL DRIVE
const uploadFile= async (fileObject,user)=>{
    if (user.curriculumId){
        await deleteFile(user.curriculumId);
    }
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileObject.buffer);
    console.log("\nCarico il file sul Drive...\n")
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
      console.log("\nCaricato ! Id del file:\n");
      console.log(response.data.id);
      return response.data.id;
    } catch (error) {
      console.log(error.message);
    }
}

//DELETE DRIVE FILE

async function deleteFile(driveFileId) {
    console.log("\nCancellando il curriculum pre-esistente... \n");
    console.log("\nID del file da cancellare:");
    console.log(driveFileId);
    try {
      const response = await drive.files.delete({
        fileId: driveFileId,
      });
      console.log("\nFatto !\n");
    } catch (error) {
      console.log(error.message);
    }
}

//GET PUBLIC LINK

async function generatePublicUrl(driveFileId) {
    try {
      const fileId = driveFileId;
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
  
      /* 
      webViewLink: View the file in browser
      webContentLink: Direct download link 
      */
      const result = await drive.files.get({
        fileId: fileId,
        fields: 'webViewLink, webContentLink',
      });
      console.log("\nInformazioni sui link del file: \n")
      console.log(result.data);
      return result.data.webViewLink;
    } catch (error) {
      console.log(error.message);
    }
  }

//MODIFICA PROFILO

router.post("/set", upload.any(), async (req,res)=>{
    var query={'mail': req.user.mail};
    try{
        const { body, files } = req;
        let curriculumDataId,linkToCurriculum;
        if (files[0]!=null){
            curriculumDataId= await uploadFile(files[0],req.user);
            linkToCurriculum= await generatePublicUrl(curriculumDataId);
        }
        await profileModel.updateOne(query, {$set:{
                //DATI BACK-END
                name:req.user.name.givenName,
                surname:req.user.name.familyName,
                mail:req.user.mail,
                //DATI FRONT-END
                ruolo: req.body.ruolo,
                azienda:req.body.azienda,
                curriculumId: curriculumDataId,
                curriculumLink: linkToCurriculum
            }
        }, {upsert: true});
        
    } catch(f){
        console.log(f.message);
    }
    console.log("Edited profile, redirecting...");
    res.redirect('/profile');
    res.end();
});    

module.exports=router;