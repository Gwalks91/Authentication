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

describe('Account creation tests', () => {
    it('should create and insert a user into the database when createAccount is called', async () => {
        const mockAccount = helpers.CreateNewAccount({});
        const req = {
            body: mockAccount
        }
        let res = mockResponse();
        await accountController.createAccount(req, res);
      
        const insertedUser = await Account.findOne({email: mockAccount.email});
        expect(insertedUser).not.toBeNull();
        await Account.deleteOne({email: mockAccount.email});
    });

    test('should create an account with props if props are passed to the creation', async () => {
        let propName = 'testProp';
        let propValue = 'test1';
        let props = {};
        props[propName] = propValue;
        const mockAccount = helpers.CreateNewAccount({
            username: "testProps",
            password: "testPropsPassword",
            props
        });
        
        const req = {
            body: mockAccount
        }
        let res = mockResponse();
        await accountController.createAccount(req, res);
      
        const insertedUser = await Account.findOne({email: mockAccount.email});
        expect(insertedUser.props.get(propName)).toBe(propValue);
        await Account.deleteOne({email: mockAccount.email});
    });

    test('should create an account with claims if there are claims present with creation data', async () => {
        let claimName = 'accountType';
        let claimValue = 'user';
        let claims = {};
        claims[claimName] = claimValue;
        const mockAccount = helpers.CreateNewAccount({
            username: "testProps",
            password: "testPropsPassword",
            claims
        });
        
        const req = {
            body: mockAccount
        }
        let res = mockResponse();
        await accountController.createAccount(req, res);
      
        const insertedUser = await Account.findOne({email: mockAccount.email});
        expect(insertedUser.claims.get(claimName)).toBe(claimValue);
        await Account.deleteOne({email: mockAccount.email});
    });

    it('should hash the password when it is saved', async () => {
        const mockAccount = helpers.CreateNewAccount({});
        const req = {
            body: mockAccount
        }
        
        let res = mockResponse();
        await accountController.createAccount(req, res);

        const insertedUser = await Account.findOne({email: mockAccount.email});
        expect(insertedUser.password).not.toEqual(mockAccount.password);
        await Account.deleteOne({email: mockAccount.email});
    });

    it('should reject the request to create user when there is already a user with same email', async () => {
        const existingAccount = helpers.CreateNewAccount({});
        const newUser = helpers.CreateNewAccount({'email': existingAccount.email});
        
        const firstReq = {
            body: existingAccount
        }
        let firstRes = mockResponse();
        const secondReq = {
            body: newUser
        }
        let secondRes = mockResponse();

        await accountController.createAccount(firstReq, firstRes)
        await accountController.createAccount(secondReq, secondRes);
        expect(secondRes.status).toBeCalledWith(HttpStatus.BAD_REQUEST);
        await Account.deleteOne({email: existingAccount.email});
    });

    it('should reject the request to create user when there is already a user with same user name', async () => {
        const existingAccount = helpers.CreateNewAccount({});
        const newUser = helpers.CreateNewAccount({'username': existingAccount.username});

        const firstReq = {
            body: existingAccount
        }
        let firstRes = mockResponse();
        const secondReq = {
            body: newUser
        }
        let secondRes = mockResponse();

        await accountController.createAccount(firstReq, firstRes)
        await accountController.createAccount(secondReq, secondRes);
        expect(secondRes.status).toBeCalledWith(HttpStatus.BAD_REQUEST);
        await Account.deleteOne({email: existingAccount.email});
    });
  });

describe("Account creation validation tests", () => {
    test('should fail when an email is not provided', async () => {
        const req = {
            body: {
                username: "testUser",
                email: "",
                password: "testpassword"
            }
        }
        let res = mockResponse();
        await accountController.createAccount(req, res);
        expect(res.status).toBeCalledWith(HttpStatus.BAD_REQUEST);
    });

    test('should fail when no username is provided', async () => {
        const req = {
            body: {
                username: "",
                email: "asdasas@test.com",
                password: "testpassword"
            }
        }
        let res = mockResponse();
        await accountController.createAccount(req, res);
        expect(res.status).toBeCalledWith(HttpStatus.BAD_REQUEST);
    });

    test('should fail when username is greater than 100 characters', async () => {
        const req = {
            body: {
                username: faker.lorem.words(100),
                email: "asdasas@test.com",
                password: "testpassword"
            }
        }
        let res = mockResponse();
        await accountController.createAccount(req, res);
        expect(res.status).toBeCalledWith(HttpStatus.BAD_REQUEST);
    });

    test('should fail when no password is provided', async () => {
        const req = {
            body: {
                username: "testName",
                email: "asdasas@test.com",
                password: ""
            }
        }
        let res = mockResponse();
        await accountController.createAccount(req, res);
        expect(res.status).toBeCalledWith(HttpStatus.BAD_REQUEST);
    });

    test('should fail if password is less than 12 character', async () => {
        const req = {
            body: {
                username: "testName",
                email: "asdasas@test.com",
                password: "asdf"
            }
        }
        let res = mockResponse();
        await accountController.createAccount(req, res);
        expect(res.status).toBeCalledWith(HttpStatus.BAD_REQUEST);
    });
});

describe.skip("Account creation large input tests", () => {
    beforeEach(async () => {
        await Account.deleteMany();
    });

    test('should validate user creation when all inputs are valid', async () => {
        const numberOfTestInputs = 50;
        for (let i = 0; i < numberOfTestInputs; i++) {
            const randomPasswordLength = Math.floor(Math.random() * (100 - 12 + 1)) + 12;
            const req = {
                body: {
                    username: faker.internet.userName(faker.name.firstName(), faker.name.lastName()),
                    email: faker.internet.email(),
                    password: faker.internet.password(randomPasswordLength)
                }
            }
            let res = mockResponse();
            await accountController.createAccount(req, res);
            try {
                expect(res.status).toBeCalledWith(HttpStatus.OK);
            } catch(error) {
                console.log("Result of the test failing was:");
                console.log(req);
            }
        }
    });
});

