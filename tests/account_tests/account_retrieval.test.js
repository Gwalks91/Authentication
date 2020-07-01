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

describe("Account retrieval tests", () => {
    let mockAccount = null;
    let createAccountRequest = null;

    beforeAll(async () => {
        mockAccount = helpers.CreateNewAccount({});
        createAccountRequest = {
            body: mockAccount
        }
    });

    test('should return a failing status code when no account is found', async () => {
        const req = {
            params: {
                id: mongoose.Types.ObjectId().toString()
            }
        };
        let res = mockResponse();
        await accountController.getAccount(req, res);
        expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    test('should return the user model when the account exists', async () => {
        let createResponse = mockResponse();
        function impl(response) {
            this.response = response;
            return this;
        };
        createResponse.send = jest.fn().mockImplementation(impl.bind(createResponse));
        await accountController.createAccount(createAccountRequest, createResponse);

        const req = {
            params: {
                id: createResponse.response.id.toString()
            }
        };
        let res = mockResponse();
        res.send = jest.fn().mockImplementation(impl.bind(res));
        await accountController.getAccount(req, res);
        expect(createResponse.response.id.toString()).toBe(res.response.id.toString());
    });

    // test('should remove the password when an account is retrieved', async () => {
    //     let res = mockResponse();
    //     const account = await accountController.createAccount(createAccountRequest, res);

    //     const req = {
    //         params: {
    //             id: account.id
    //         }
    //     };
    //     await accountController.getAccount(req, res);
    //     expect(res.password).toBeNull();

    // });
});