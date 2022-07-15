const amqp = require('amqplib');
var express = require('express');
const {createWriteStream, toQueue} = require('amqplib-stream');
const { google } = require('googleapis');


const router = express.Router();
router.use(express.static(__dirname + '/../public/'));

const Queue = require("../models/queue");
const Profile = require("../models/profile");
const { request } = require('express');

const rabbitSettings = {
    protocol: 'amqp',
    hostname: 'rabbitmq',
    port: 5672,
    username: 'guest',
    password: 'guest',
    authMechanism: ['PLAIN', 'AMQPLAIN', 'EXTERNAL']
};
let messaggi = []
var queueData;


//GOOGLEAPIs
const GOOGLE_CLIENT_ID= process.env['GOOGLE_CLIENT_ID'];
const GOOGLE_CLIENT_SECRET= process.env['GOOGLE_CLIENT_SECRET'];


const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
);

const calendar = google.calendar({version:'v3', auth:oauth2Client});

router.post('/event', (req,res)=>{
    const event = {
        summary: req.body.titolo,
        location: req.body.luogo,
        description: req.body.descrizione,
        start: {
            dateTime:new Date(req.body.startTime).toISOString().replace('Z', ''),
            timeZone: "Europe/Rome"


        },
        end: {
            dateTime: new Date(req.body.endTime).toISOString().replace('Z', ''),
            timeZone: "Europe/Rome"
        },
        colorId: 8
    };
   // console.log(req.body.timezone)
    calendar.events.insert({
        auth: oauth2Client,
        calendarId: 'primary',
        resource:event
        }, err => {
        if(err) return console.error("errore creazione evento: ",err)
        return console.log("evento creato nel calendario")
    })
    res.redirect('/chat?to=' + queueData.nome.replace(req.user.mail, '').replace(',', ''));
});

router.get('', async(req, res) => {
    
    oauth2Client.setCredentials({ access_token: req.user.accessToken, refresh_token: req.user.refreshToken });

    //CONTROLLA SE IL DESTINATARIO E' REGISTRATO
    let profileTo = await Profile.findOne({ mail: req.query.to });


    connetti()
    async function connetti() {

        if (profileTo && profileTo.length != 0) {
            queueData = {
                nome: [req.user.mail, req.query.to].sort().join()
            }
            await Queue.findOne({ nome: queueData.nome })
                .then(async(result) => {
                    if (!result) {
                        result = await Queue.create(queueData);
                        console.log("\nNuova Queue nel database\n");
                        console.log("\nRisultato: " + result);
                    } else {
                        console.log("\nQueue già presente nel database\n");
                    }
                })
                .catch((err) => {
                    console.error(err.message)
                });
            try {
                const conn = await amqp.connect(rabbitSettings);
                const channel = await conn.createChannel();

                await channel.assertQueue(queueData.nome);
                await channel.consume(queueData.nome, msg => (console.log('ricevuto'),
                    messaggi.push(msg.content.toString())
                ))
                console.log(messaggi);
                console.log(req.query);
                res.render('./chat', { msg: messaggi, user: req.user, profileTo: profileTo });

            } catch (err) {
                console.error(`Error -> ${err}`);
            }
        } else {
            res.redirect('/allChats');
        }
    }
});


router.post('/invia', function(req, res, next) {
    if (req.body.message != '') {
        connect();
        async function connect() {
            console.log("NOME QUEUEDATA: \n\n" + queueData.nome);

            try {
                const channelPromise = amqp.connect(rabbitSettings).then(conn => conn.createChannel());

                channelPromise.then(() => {
                    const myQueueStream = createWriteStream({
                        channel: channelPromise,
                        write: toQueue(queueData.nome)
                    });
                    myQueueStream.write(req.user.mail + ": " + req.body.message + '\n');
                });
            } catch (err) {
                console.error(`Error -> ${err}`);
            }
        }
    }
    res.redirect('/chat?to=' + queueData.nome.replace(req.user.mail, '').replace(',', ''));
});


module.exports = router;