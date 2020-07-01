const Joi = require("@hapi/joi");
const {accountScheme} = require("./account_validation");

const loginValidation = async (data) => {
    const schema = Joi.object({
        email: accountScheme.email.required(),
        password: accountScheme.password.required()
    });
    return await schema.validateAsync(data);
};

module.exports = loginValidation;