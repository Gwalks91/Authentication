const Joi = require('@hapi/joi');
const Account = require('../models/account');

const accountScheme = {
    username: Joi.string()
        .max(100)
        .trim(),
    firstName: Joi.string()
        .max(100)
        .trim(),
    lastName: Joi.string()
        .max(100)
        .trim(),
    email: Joi.string()
        .min(10)
        .max(100)
        .trim()
        .email(),
    password: Joi.string()
        .min(12)
        .trim(),
    claims: Joi.object(),
    props: Joi.object()
};

const accountCreationValidation = async (data, validationOptions) => {
    const schema = Joi.object({
        username: accountScheme.username.required(),
        firstName: accountScheme.firstName.required(),
        lastName: accountScheme.lastName.required(),
        email: accountScheme.email.required(),
        password: accountScheme.password.required(),
        claims: accountScheme.claims,
        props: accountScheme.props
    });
    return await schema.validateAsync(data, validationOptions);
};

const accountUpdateValidation = async (data, validationOptions) => {
    const schema = Joi.object({
        username: accountScheme.username,
        firstName: accountScheme.firstName,
        lastName: accountScheme.lastName,
        email: accountScheme.email,
        password: accountScheme.password,
        claims: accountScheme.claims,
        props: accountScheme.props
    });
    return await schema.validateAsync(data, validationOptions);
};

const checkAccountExists = async (req) => {
    let accountExists = await Account.findOne({email: req.body.email});
    if (accountExists) {
        return {
            accountExists:true,
            error: "User already registered with that email."
        };
    }
    accountExists = await Account.findOne({username: req.body.username});
    if (accountExists) {
        return {
            accountExists:true,
            error: "Username already exists."
        };
    }
    return { accountExists: false };
};

module.exports = {
    accountScheme,
    accountCreationValidation,
    accountUpdateValidation,
    checkAccountExists
}