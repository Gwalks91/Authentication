const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    development: {
        dbConnection: process.env.DEV_DB_CONNECTION
    },
    test: {
        dbConnection: process.env.TEST_DB_CONNECTION
    }
}