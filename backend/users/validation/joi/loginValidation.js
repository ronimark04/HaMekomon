const Joi = require("joi");

const loginValidation = (user) => {
    const schema = Joi.object({
        email: Joi.string()
            .ruleset.pattern(
                /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/
            )
            .rule({ message: 'Please enter a valid email address' })
            .required(),

        password: Joi.string()
            .min(1)
            .rule({ message: 'Password is required' })
            .required(),
    });
    return schema.validate(user);
};

const validateLogin = (user) => {
    const { error } = loginValidation(user);
    if (error) return error.details[0].message;
    return "";
};

module.exports = validateLogin;