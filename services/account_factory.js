const bcrypt = require('bcryptjs');
const Account = require('../models/account');

class accountFactory {
    constructor() {
        this.createAccount = async function(accountData) {
            const password = await this._encryptPassword(accountData.password);

            return new Account({
                username: accountData.username,
                firstName: accountData.firstName,
                lastName: accountData.lastName,
                email: accountData.email,
                password,
                props: accountData.props,
                claims: accountData.claims
            });
        }

        this._encryptPassword = async function(password) {
            const salt = await bcrypt.genSalt(10);
            return await bcrypt.hash(password, salt);
        }
    }
}

module.exports = accountFactory;