const Joi = require('@hapi/joi');
const faker = require('faker');
const HttpStatus = require('http-status-codes');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const helpers = require('./helpers');

const envConfigs = require('../config');
const { mockResponse } = require('./express_mocks');
const Account = require('../models/account');

const controller = require('../controllers/account_controller');
const accountFactory = require('../services/account_factory');
const authController = require('../controllers/authentication_controller');

const accountController = new controller(new accountFactory());

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
});

afterAll(async () => {
    await Account.deleteMany();
    await mongoose.disconnect()
});

describe("Authentication tests",  () => {
    // it("should return a users information when loging in with valid credentials", async () => {
    //     const mockAccount = helpers.CreateNewAccount({});
    //     const req = {
    //         body: mockAccount
    //     }
    //     let res = mockResponse();
    //     await accountController.createAccount(req, res);

    //     const loginReq = {
    //         body: {
    //             email: mockAccount.email,
    //             password: mockAccount.password
    //         }
    //     }
    //     let loginRes = mockResponse();
    //     await authController.login(loginReq, loginRes);
        
    //     expect(loginRes.header).toBeCalled();
    //     expect(loginRes.response).not.toBeNull();
    // });

    it("should return a unauthorized status when no body is present in the request", async () => {
        const loginReq = {
            body: {}
        }
        let loginRes = mockResponse();
        

        await authController.login(loginReq, loginRes);
        expect(loginRes.status).toBeCalledWith(HttpStatus.UNAUTHORIZED);
        expect(loginRes.send).toBeCalledWith("\"email\" is required")
    });

    it("should return a unauthorized status when email does not match the requirements", async () => {
        const loginReq = {
            body: {
                email: "test.user",
                password: "testpassword1234"
            }
        }
        let loginRes = mockResponse();
        await authController.login(loginReq, loginRes);
        expect(loginRes.status).toBeCalledWith(HttpStatus.UNAUTHORIZED);
        expect(loginRes.send).toBeCalledWith("\"email\" length must be at least 10 characters long")
    });

    it("should return a unauthorized status when password does not match the requirements", async () => {
        const loginReq = {
            body: {
                email: "test.user@test.com",
                password: "fail"
            }
        }
        let loginRes = mockResponse();
        await authController.login(loginReq, loginRes);
        expect(loginRes.status).toBeCalledWith(HttpStatus.UNAUTHORIZED);
        expect(loginRes.send).toBeCalledWith("\"password\" length must be at least 12 characters long")
    });

    it("should return an unauthorized status when no account exists with a given email", async () => {
        const loginReq = {
            body: {
                email: "test.user@test.com",
                password: "testpassword1234"
            }
        }
        let loginRes = mockResponse();
        await authController.login(loginReq, loginRes);
        
        expect(loginRes.status).toBeCalledWith(HttpStatus.UNAUTHORIZED);
    });

    it("should return an unauthorized status when the password provided is not correct", async () => {
        const mockAccount = helpers.CreateNewAccount({});
        const req = {
            body: mockAccount
        }
        let res = mockResponse();
        await accountController.createAccount(req, res);

        const loginReq = {
            body: {
                email: mockAccount.email,
                password: "notrealpassword1234"
            }
        }
        let loginRes = mockResponse();
        await authController.login(loginReq, loginRes);
        
        expect(loginRes.status).toBeCalledWith(HttpStatus.UNAUTHORIZED);
    });
});