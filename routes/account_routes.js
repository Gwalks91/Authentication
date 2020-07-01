const router = require('express').Router();
const controller = require('../controllers/account_controller');
const accountFactory = require('../services/account_factory');

const verifyAccount = require('../services/verify_login_middleware');
const accountController = new controller(new accountFactory());

// Get account information
router.get('/', verifyAccount, accountController.getAccountsList);
router.get('/:id', verifyAccount, accountController.getAccount);

// Create a new account
router.post('/', accountController.createAccount);

// Update an existing account
router.put('/:id', verifyAccount, accountController.updateAccount);

// Remove multiple or a single account
router.delete('/', verifyAccount, accountController.deleteAccounts);
router.delete('/:id', verifyAccount, accountController.deleteAccounts);

module.exports = router;