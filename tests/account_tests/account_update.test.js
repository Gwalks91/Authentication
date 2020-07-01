const faker = require('faker');
const HttpStatus = require('http-status-codes');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const helpers = require('../helpers');

const envConfigs = require('../../config');
const { mockResponse } = require('../express_mocks');
const Account = require('../../models/account');

const controller = require('../../controllers/account_controller');
const accountFactory = require('../../services/account_factory');
const accountController = new controller(new accountFactory());

jest.mock("bcryptjs");

beforeAll(async () => {
    const env = process.env.NODE_ENV || 'development';
    const config = envConfigs[env];
    
    await mongoose.connect(
        config.dbConnection,
        { 
            useNewUrlParser: true,
            useUnifiedTopology: true 
        }
    );
    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockResolvedValue("hashedPassword");
});

afterAll(async () => {
    await Account.deleteMany();
    await mongoose.disconnect()
});

describe("Account update tests", () => {
    function runUpdateValidationtest(account) {
        test('should not validate an update when the data sent is not correct', async () => {
            const req = {
                body: account
            }
            let res = mockResponse();
            await accountController.updateAccount(req, res);
            expect(res.status).toBeCalledWith(HttpStatus.BAD_REQUEST);
        });
    }
    runUpdateValidationtest({username: "01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789"});
    runUpdateValidationtest({email: "badEmail"});
    runUpdateValidationtest({password: "shortpass"});

    test('should validate the request before the database is called', async () => {
        jest.spyOn(accountController, "_getAccountById");
        const req = {
            body: {email: "badEmail"}
        }
        let res = mockResponse();
        await accountController.updateAccount(req, res);
        expect(res.status).toBeCalledWith(HttpStatus.BAD_REQUEST);

    });

    test('should fail if there is no account found to update', async () => {
        const req = {
            params: {
                id: mongoose.Types.ObjectId()
            },
            body: {
                username: "newUserName"
            }
        }
        let res = mockResponse();
        await accountController.updateAccount(req, res);
        expect(res.status).toBeCalledWith(HttpStatus.BAD_REQUEST);
    });

    test('should return the updated account when the update is sucessful', async () => {
        const mockAccount = helpers.CreateNewAccount({});
        const req = {
            body: mockAccount
        }
        let res = mockResponse();
        await accountController.createAccount(req, res);
        const insertedUser = await Account.findOne({email: mockAccount.email});
        const updatedName = "UpdatesUserName";
        const updateReq = {
            params: {
                id: insertedUser.id
            },
            body: {
                username: updatedName,
                firstName: undefined,
                lastName: undefined,
                email: undefined,
                password: undefined
            }
        }
        let updateRes = mockResponse();
        await accountController.updateAccount(updateReq, updateRes);
        expect(res.response).not.toBeNull();
        expect(res.status).toBeCalledWith(HttpStatus.OK);
    });
});