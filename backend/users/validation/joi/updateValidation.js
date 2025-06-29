const Joi = require('joi');

const updateValidation = (user) => {
    const schema = Joi.object({
        username: Joi.string()
            .min(3)
            .max(16)
            .pattern(/^[a-zA-Z][a-zA-Z0-9_]*$/)
            .rule({ message: 'Username must start with a letter and can only contain English letters, numbers, and underscores (3-16 characters)' })
            .required(),
        email: Joi.string()
            .ruleset.pattern(
                /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/
            )
            .rule({ message: 'Must be a valid email address' })
            .required(),
        password: Joi.string()
            .regex(
                /((?=.*\d{1})(?=.*[A-Z]{1})(?=.*[a-z]{1})(?=.*[!@#$%^&*-]{1}).{7,20})/
            ).message({
                message:
                    'Must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number and one of the following characters !@#$%^&*-',
            })
            .required(),
        isAdmin: Joi.boolean().allow(""),
    });
    return schema.validate(user);
};

const adminStatusValidation = (user) => {
    const schema = Joi.object({
        isAdmin: Joi.boolean().required(),
    });
    return schema.validate(user);
};

const validateUpdate = (user) => {
    const { error } = updateValidation(user);
    if (error) return error.details[0].message;
    return "";
};

const validateAdminStatusUpdate = (user) => {
    const { error } = adminStatusValidation(user);
    if (error) return error.details[0].message;
    return "";
};

module.exports = { validateUpdate, validateAdminStatusUpdate };