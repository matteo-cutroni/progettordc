//DEPENDENCIES
const express = require('express');
const mongoose = require("mongoose");

//ROUTER CHE BISOGNA ESPORTARE
const router = express.Router();

//ATTIVA IL PUBLIC
router.use(express.static(__dirname + '/../public'));

const Annuncio = require("../models/annuncio");
const Queue = require("../models/queue");
const Profile = require("../models/profile");


// --------------------- TEST ENDPOINT --------------------- //
router.get('/', function(req, res) {
    res.status(200).json(JSON.stringify({ api_working: true }));
});



/**
 * @api {get} /datori Richiede una lista dei datori
 * @apiGroup Utenti
 * @apiDescription Restituisce tutti i datori di lavoro registrati su Jobify
 * @apiParamExample {text} Esempio-Richiesta:
 *     https://localhost/api/datori
 * @apiSuccess {String} mail Mail del datore di lavoro
 * @apiSuccess {String} azienda Azienda del datore di lavoro
 * @apiSuccess {String} googleId Id Google del datore di lavoro
 * @apiSuccess {String} name Nome del datore di lavoro
 * @apiSuccess {String} surname Cognome del datore di lavoro
 * @apiSuccessExample {json} Esempio-Risposta:
 *    HTTP/1.1 200 OK
 *    [{
 *      "googleId":"116745546033285546886",
 *      "mail":"papa.1896945@studenti.uniroma1.it",
 *      "name":"Matteo",
 *      "surname":"Papa",
 *      "azienda":"RESET S.R.L"
 *    }]
 */

router.get('/datori', async(req, res) => {
    let datori = await Profile.find({ ruolo: 'datore' }, { _id: 0, mail: 1, name: 1, surname: 1, googleId: 1, azienda: 1 });
    console.log(datori);

    res.status(200).json(datori);
});

/**
 * @api {get} /lavoratori  Richiede una lista dei lavoratori
 * @apiGroup Utenti
 * @apiDescription Restituisce tutti i lavoratori registrati su Jobify
 * @apiParamExample {text} Esempio-Richiesta:
 *     https://localhost:8083/api/lavoratori
 * @apiSuccess {String} mail Mail del lavoratore
 * @apiSuccess {String} azienda Azienda del lavoratore
 * @apiSuccess {String} googleId Id Google del lavoratore
 * @apiSuccess {String} name Nome del lavoratore
 * @apiSuccess {String} surname Cognome del lavoratore
 * @apiSuccessExample {json} Esempio-Risposta:
 *    HTTP/1.1 200 OK
 *    [{
 *      "googleId":"116745546033285546886",
 *      "mail":"papa.1896945@studenti.uniroma1.it",
 *      "name":"Matteo",
 *      "surname":"Papa",
 *      "azienda":"RESET S.R.L"
 *    }]
 */

router.get('/lavoratori', async(req, res) => {
    let lavoratori = await Profile.find({ ruolo: 'lavoratore' }, { _id: 0, mail: 1, name: 1, surname: 1, googleId: 1, azienda: 1 });
    console.log(lavoratori);

    res.status(200).json(lavoratori);
});

/**
 * @api {get} /job/:datore Richiedi tutti gli annunci di un lavoratore specifico
 * @apiGroup Annunci
 * @apiDescription Restituisce tutti gli annunci lavorativi pubblicati da uno specifico datore su Jobify
 * @apiParam datore GoogleId del datore di lavoro che si intende specificare
 * @apiParamExample {text} Esempio-Richiesta:
 *     https://localhost:8083/api/job/106380052854846251274
 * @apiSuccess {String} mail Mail del datore di lavoro che ha pubblicato l'annuncio
 * @apiSuccess {String} azienda Azienda del datore di lavoro che ha pubblicato l'annuncio
 * @apiSuccess {String} lavoro Il lavoro proposto
 * @apiSuccess {String} requisiti I requisiti richiesti per svolgere tale lavoro
 * @apiSuccess {Date} date Data di pubblicazione dell'annuncio
 * @apiSuccessExample {json} Esempio-Risposta:
 *    HTTP/1.1 200 OK
 *      [{
 *           "mail":"superteo001@gmail.com",
 *           "azienda":"RESET S.R.L",
 *           "lavoro":"Operaio",
 *           "requisiti":"5 Anni di esperienza",
 *           "date":"2022-07-10T16:28:22.719Z"
 *       },{   
 *           "mail":"superteo001@gmail.com",
 *           "azienda":"RESET S.R.L",
 *           "lavoro":"Architetto",
 *           "requisiti":"110 e lode in Architettura",
 *           "date":"2022-07-10T16:28:22.719Z"
 *       }]
 */

router.get('/job/:datore', async(req, res) => {
    let datore = await Profile.findOne({ googleId: req.params.datore, ruolo: 'datore' });

    if (datore && datore.length != 0) {
        console.log(datore);
        let job = await Annuncio.find({ mail: datore.mail }, { _id: 0, mail: 1, lavoro: 1, azienda: 1, requisiti: 1, date: 1 });
        console.log(job);

        if (job) {
            res.status(200).json(job);
        }
    } else {
        res.status(404).json({
            error: 'Il googleId specificato non appartiene a nessun datore di lavoro'
        });
    }
});

/**
 * @api{get} /jobs Richiedi tutti gli annunci
 * @apiGroup Annunci
 * @apiDescription Restituisce tutti gli annunci lavorativi pubblicati su Jobify
 * @apiParamExample {text} Esempio-Richiesta:
 *     https://localhost/api/jobs
 * @apiSuccess {String} mail Mail del datore di lavoro che ha pubblicato l'annuncio
 * @apiSuccess {String} azienda Azienda del datore di lavoro che ha pubblicato l'annuncio
 * @apiSuccess {String} lavoro Il lavoro proposto
 * @apiSuccess {String} requisiti I requisiti richiesti per svolgere tale lavoro
 * @apiSuccess {Date} date Data di pubblicazione dell'annuncio
 * @apiSuccessExample {json} Esempio-Risposta:
 *    HTTP/1.1 200 OK
 *    [{
 *      "mail": 'papa.1896945@studenti.uniroma1.it',
 *      "azienda": "Reset S.P.A",
 *      "lavoro": 'operaio'
 *      "requisiti": "5 anni di esperienza minima.",
 *      "date": "2022-07-10T16:28:22.719Z"
 *    },{
 *      "mail": 'cutroni.1918336@studenti.uniroma1.it',
 *      "azienda": "Google LLC",
 *      "lavoro": 'Web Developer'
 *      "requisiti": "Conoscenza approfondita di HTML, CSS e Bootstrap",
 *      "date": "2022-07-15T16:35:19.719Z"
 *    }]
 */

router.get('/jobs', async(req, res) => {
    let jobs = await Annuncio.find({}, { _id: 0, mail: 1, lavoro: 1, azienda: 1, requisiti: 1, date: 1 });
    console.log(jobs);

    res.status(200).json(jobs);
});

module.exports = router;