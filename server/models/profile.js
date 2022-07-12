const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true,
    },
    mail: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    bornOn: {
        type: Date,
        default: Date.now
    },
    ruolo: {
        type: String
    },
    azienda: {
        type: String
    },
    curriculumId: {
        type: String
    },
    curriculumLink: {
        type: String
    },
    picture: {
        type: String
    },
    accessToken: {
        type: String
    }
});

module.exports = mongoose.model('profile', profileSchema);