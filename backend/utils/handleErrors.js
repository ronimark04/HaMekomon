const chalk = require("chalk");

const handleError = (res, status, message = "") => {
    console.log(chalk.red(message));
    return res.status(status).json({ message });
};

module.exports = { handleError };