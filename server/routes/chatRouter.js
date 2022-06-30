const amqp = require('amqplib');
var express = require('express');
const {createWriteStream, toQueue} = require('amqplib-stream');
const mongoose = require("mongoose");

const router=express.Router();
router.use(express.static(__dirname + '/../public/'));

const Queue = require("../models/queue");

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

router.post('',(req,res)=>{

    connetti()
    async function connetti() {
        
        queueData = {
            nome:[req.user.mail, req.body.mail].sort().join()
        }
        await Queue.findOne({nome: queueData.nome})
        .then(async (result) => {
            if (!result) {
            result = await Queue.create(queueData);
            console.log("\nNuova Queue nel database\n");
            console.log("\nRisultato: " + result);
            }
            else{
            console.log("\nQueue già presente nel database\n");
            } 
        })
        .catch((err) => {
            console.error(err.message)
        });
        try{
            const conn = await amqp.connect(rabbitSettings);
            const channel = await conn.createChannel();
            
            await channel.assertQueue(queueData.nome);
            await channel.consume(queueData.nome, msg =>( console.log('ricevuto'),
                messaggi.push(msg.content.toString())
            ))
            console.log(messaggi)

            res.render('./chat', {msg: messaggi, user: req.user})

        }catch(err){
            console.error(`Error -> ${err}`);
        }
    }
});


router.post('/invia', function (req, res, next) {
    connect();
    async function connect(){
        console.log(queueData.nome);

        try{
            const channelPromise = amqp.connect(rabbitSettings).then(conn => conn.createChannel());
            
            channelPromise.then(() => {
                const myQueueStream = createWriteStream({
                  channel: channelPromise,
                  write: toQueue(queueData.nome)
                });
                myQueueStream.write(req.body.message);
            });
        }catch(err){
            console.error(`Error -> ${err}`);
        }
    }
    if (messaggi.length == 0){
        res.render('./chat', {msg: req.body.message + '\n',user: req.user});
    }else{
        res.render('./chat', {msg: messaggi +','+req.body.message,user: req.user});
    }
});


module.exports = router;
