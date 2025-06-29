const User = require('./mongodb/User');
const { generateAuthToken } = require("../../auth/providers/jwt");
const { generatePassword, comparePasswords } = require('../helpers/bcrypt');

const registerUser = async (newUser) => {
    try {
        // Check for existing email
        const existingUserByEmail = await User.findOne({ email: newUser.email });
        if (existingUserByEmail) {
            const error = new Error("An account with this email already exists. Please log in instead.");
            error.status = 400;
            throw error;
        }

        // Check for existing username
        const existingUserByUsername = await User.findOne({ username: newUser.username });
        if (existingUserByUsername) {
            const error = new Error("This username is already taken. Please choose a different username.");
            error.status = 400;
            throw error;
        }

        newUser.password = await generatePassword(newUser.password);
        let user = new User(newUser);
        user = await user.save();
        const lessInfoUser = { email: user.email, username: user.username, _id: user._id };
        return lessInfoUser;
    } catch (error) {
        throw error;
    }
};

const getUser = async (userId) => {
    try {
        let user = await User.findById(userId);
        return user;
    }
    catch (err) {
        throw err;
    }
};

const loginUser = async (email, password) => {
    try {
        const userFromDB = await User.findOne({ email: email });
        if (!userFromDB) {
            const error = new Error("Email not found. Please check your email or sign up for a new account.");
            error.status = 401;
            throw error;
        }

        const isPasswordCorrect = await comparePasswords(password, userFromDB.password);
        if (!isPasswordCorrect) {
            const error = new Error("Incorrect password. Please try again.");
            error.status = 401;
            throw error;
        }

        const token = generateAuthToken(userFromDB);
        return {
            token,
            user: {
                _id: userFromDB._id,
                email: userFromDB.email,
                username: userFromDB.username,
                isAdmin: userFromDB.isAdmin
            }
        };
    }
    catch (err) {
        throw err;
    }
};

const updateUser = async (userId, updatedUser) => {
    try {
        let user = await User.findByIdAndUpdate(userId, updatedUser, { new: true });
        return user;
    } catch (err) {
        throw err;
    }
}

const getUsers = async () => {
    try {
        let users = User.find();
        return users;
    }
    catch (err) {
        throw err;
    }
}

const deleteUser = async (userId) => {
    try {
        let user = await User.findByIdAndDelete(userId);
        return user;
    }
    catch (err) {
        throw err;
    }
}

const changePassword = async (userId, currentPassword, newPassword) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            const error = new Error("User not found");
            error.status = 404;
            throw error;
        }

        // Verify current password
        const isCurrentPasswordCorrect = await comparePasswords(currentPassword, user.password);
        if (!isCurrentPasswordCorrect) {
            const error = new Error("Current password is incorrect");
            error.status = 401;
            throw error;
        }

        // Hash new password and update
        const hashedNewPassword = await generatePassword(newPassword);
        user.password = hashedNewPassword;
        await user.save();

        return { message: "Password updated successfully" };
    } catch (err) {
        throw err;
    }
}

module.exports = { registerUser, getUser, loginUser, updateUser, getUsers, deleteUser, changePassword };