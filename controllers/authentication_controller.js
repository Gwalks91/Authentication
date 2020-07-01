const HttpStatus = require('http-status-codes');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginValidation = require('../models/login_validation');
const Account = require('../models/account');

const {formatError} = require('../services/error_service');
const localize = require('../services/localization_service');

const login = async (req, res) => {
    // Validation
    try {
        await loginValidation(req.body);
    } catch (error) {
        return res.status(HttpStatus.UNAUTHORIZED).send(error.details[0].message);
    }

    const loginValidationError = formatError(localize('login_validation_error'));
    // Check if the user is created
    const account = await Account.findOne({email: req.body.email});
    if (!account) {
        return res.status(HttpStatus.UNAUTHORIZED).send(loginValidationError);
    }
    const validPassword = await bcrypt.compare(req.body.password, account.password);
    if (!validPassword) {
        return res.status(HttpStatus.UNAUTHORIZED).send(loginValidationError);
    }

    const jwtToken = jwt.sign({_id: account._id, claims: account.claims}, process.env.TOKEN_SECRET, {expiresIn: process.env.AUTH_TOKEN_TIMEOUT});

    res.header("Authorization", jwtToken);
    res.cookie("api-auth", jwtToken, {maxAge: process.env.AUTH_TOKEN_TIMEOUT, signed: true});

    res.send({token: jwtToken, id: account._id});
};

const logout = async (req, res) => {
 
};

module.exports = {
    login,
    logout
};