const mongoose= require('mongoose');

const annuncioSchema= new mongoose.Schema({
    googleId:{
        type: String,
        required: true
    },
    azienda:{
        type: String,
        required: true
    },
    picture:{
        type: String,
        required: true
    },
    lavoro:{
        type: String,
        required:true
    },
    requisiti:{
        type: String,
        required:true
    },
    date:{
        type: Date,
        default: Date.now
    }
});

module.exports= mongoose.model('annuncio',annuncioSchema);