const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        max: 100
    },
    firstName: {
        type: String,
        required: true,
        max: 100
    },
    lastName: {
        type: String,
        required: true,
        max: 100
    },
    email: {
        type: String,
        required: true,
        max: 100,
        min: 10
    },
    password: {
        type: String,
        required: true,
        min: 12
    },
    date: {
        type: Date,
        default: Date.now
    },
    claims: {
        type: Map
    },
    props: {
        type: Map
    }
});

module.exports = mongoose.model('Account', accountSchema);