const amqp = require('amqplib');
var express = require('express');
const { createWriteStream, toQueue } = require('amqplib-stream');
const mongoose = require("mongoose");

const router = express.Router();
router.use(express.static(__dirname + '/../public/'));

const Queue = require("../models/queue");
const Profile = require("../models/profile");

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

router.get('', async(req, res) => {
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