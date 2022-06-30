const mongoose= require('mongoose');

const queueSchema= new mongoose.Schema({
    nome:{
        type: String,
        required: true
    }
});

module.exports= mongoose.model('queue',queueSchema);