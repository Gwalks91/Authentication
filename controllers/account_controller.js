const HttpStatus = require('http-status-codes');
const { formatError } = require('../services/error_service');

const { accountCreationValidation, accountUpdateValidation, checkAccountExists } = require('../models/account_validation');
const Account = require('../models/account');

class accountController {
    constructor(accountFactory) {
        this.factory = accountFactory;

        // Need to wrap a timeout mechanism here
        this.createAccount = async (req, res) => {
            try {
                await accountCreationValidation(req.body);

                const {accountExists, error} = await checkAccountExists(req);
                if (accountExists) {
                    res.status(HttpStatus.BAD_REQUEST).send(error);
                    return;
                }
                
                const account = await this.factory.createAccount(req.body);

                const response = await account.save();
                res.status(HttpStatus.OK).send({id: response._id});
            } catch(error) {
                res.status(HttpStatus.BAD_REQUEST).send(error.details);
                return;
            }
        };

        this.getAccountsList = async (req, res) => {
            const query = Account.find()
            query.setOptions();
        };

        this.getAccount = async (req, res) => {
            let account = await this._getAccountById(req.params.id.toString(), ["password"])
            if (account == null) {
                res.status(HttpStatus.BAD_REQUEST).send(formatError(`No account found with Id: ${req.params.id}`));
                return;
            }
            res.status(HttpStatus.OK).send(account);
        };

        this.updateAccount = async (req, res) => {
            try {
                await accountUpdateValidation(req.body, {allowUnknown: true, stripUnknown: true});

                this._createAccountUpdate(req);

                const response = await Account.findOneAndUpdate(
                    {_id: req.params.id.toString()}, 
                    req.body, 
                    {omitUndefined: true, lean: true}).select("-password");
                if (response.length === 0) {
                    res.status(HttpStatus.BAD_REQUEST)
                        .send(formatError(`Account matching Id = ${req.params.id.toString()} was not found or update failed.`));
                    return;
                }
                res.status(HttpStatus.OK).send(response);
            } catch(error) {
                res.status(HttpStatus.BAD_REQUEST).send(error.details);
                return;
            }

        };

        this.deleteAccounts = async (req, res) => {
        };

        this._createAccountUpdate = async (req) => {
            for (let [key, value] of Object.entries(req.body)) {
                if (value == null) {
                    delete req.body[key];
                }
            }
        }

        this._getAccountById = async (id, propsToRemove) => {
            let toRemove = "";
            for (let prop in propsToRemove) {
                toRemove += `-${propsToRemove[prop]} `;
            }
            const account = await Account.findOne({_id: id})
                .select(toRemove)
                .exec();
            return account
        }

    }
};

module.exports = accountController
