const bcrypt = require('bcryptjs');

const generatePassword = async (password) => bcrypt.hashSync(password, 10);

const comparePasswords = async (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword);
}

module.exports = { generatePassword, comparePasswords };