const Faker = require('faker');

const CreateNewAccount = (presetValues) => {
    const newAccount = {
        username: Faker.internet.userName(Faker.name.firstName(), Faker.name.lastName()),
        firstName: Faker.name.firstName(),
        lastName: Faker.name.lastName(),
        email: Faker.internet.email(),
        password: Faker.internet.password(12)
    };

    for (let key of Object.keys(presetValues)) {
        let value = presetValues[key];
        newAccount[key] = value;
    }
    return newAccount;
};

module.exports = {
    CreateNewAccount
}