const HttpStatus = require('http-status-codes');
const jwt = require('jsonwebtoken');

const {formatError} = require('../services/error_service');
const localize = require('../services/localization_service');

module.exports = function (req, res, next) {
    const token = req.header('Authorization');
    
    if (!token && !req.signedCookies['api-auth']) return res.status(HttpStatus.UNAUTHORIZED).send(formatError(localize('user_unauthorized_error')));

    const value = token || req.signedCookies['api-auth'];

    try {
        const verified = jwt.verify(value, process.env.TOKEN_SECRET);

        res.user = verified;
        next();
    } catch(error) {
        res.status(HttpStatus.UNAUTHORIZED).send(formatError(localize('user_unauthorized_error')));
    }
}