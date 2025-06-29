const auth = require('../../auth/authService');
const { handleError } = require('../../utils/handleErrors');
const { registerUser, getUser, loginUser, updateUser, getUsers, deleteUser, changePassword } = require('../models/userAccessDataService');
const express = require('express');
const validateLogin = require('../validation/joi/loginValidation');
const validateRegistration = require('../validation/joi/registerValidation');
const { validateUpdate, validateAdminStatusUpdate } = require('../validation/joi/updateValidation');
const { normalizeUser } = require('../helpers/normalize');
const { comparePasswords } = require('../helpers/bcrypt');
const User = require('../models/mongodb/User');
const router = express.Router();

// register
router.post("/", async (req, res) => {
    try {
        const validateErrorMessage = validateRegistration(req.body);
        if (validateErrorMessage !== "") {
            return handleError(res, 400, "Validation Error: " + validateErrorMessage);
        }
        let user = await normalizeUser(req.body);
        user = await registerUser(user);
        res.send(user);
    } catch (error) {
        handleError(res, error.status || 400, error.message);
    }
});

// get all users
router.get("/", auth, async (req, res) => {
    try {
        const userInfo = req.user;
        if (!userInfo.isAdmin) {
            handleError(res, 403, "Authorization Error: Non admin users are not authorized to access this information");
        }
        users = await getUsers();
        res.send(users);
    }
    catch (error) {
        handleError(res, error.status || 400, error.message);
    }
})

// login
router.post("/login", async (req, res) => {
    try {
        const validateErrorMessage = validateLogin(req.body);
        if (validateErrorMessage !== "") {
            return handleError(res, 400, "Validation Error: " + validateErrorMessage);
        }
        let { email, password } = req.body;
        const authData = await loginUser(email, password);
        res.send(authData);
    } catch (error) {
        handleError(res, error.status || 400, error.message);
    }
});

// get user by id
router.get("/:id", async (req, res) => {
    try {
        let { id } = req.params;
        let user = await getUser(id);
        res.send(user);
    } catch (error) {
        handleError(res, error.status || 400, error.message);
    }
});

// update user
router.put("/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;
        const updatedUser = req.body;
        const userInfo = req.user;

        // Check if user is updating their own profile or if admin is updating someone else
        if (id !== userInfo._id && !userInfo.isAdmin) {
            return handleError(res, 403, "Authorization Error: Only the verified user can edit their profile");
        }

        // If admin is updating another user, only allow isAdmin field changes
        if (id !== userInfo._id && userInfo.isAdmin) {
            const allowedFields = ['isAdmin'];
            const hasUnauthorizedFields = Object.keys(updatedUser).some(key => !allowedFields.includes(key));
            if (hasUnauthorizedFields) {
                return handleError(res, 403, "Authorization Error: Admins can only update admin status of other users");
            }

            // Use admin status validation for admin updates
            const valErrorMessage = validateAdminStatusUpdate(updatedUser);
            if (valErrorMessage !== "") {
                return handleError(res, 400, "Validation Error: " + valErrorMessage);
            }
        } else {
            // Use full validation for other updates
            const valErrorMessage = validateUpdate(updatedUser);
            if (valErrorMessage !== "") {
                return handleError(res, 400, "Validation Error: " + valErrorMessage);
            }
        }

        // If regular user is updating their own profile, don't allow isAdmin changes
        if (id === userInfo._id && !userInfo.isAdmin && updatedUser.hasOwnProperty('isAdmin')) {
            return handleError(res, 403, "Authorization Error: Users cannot change their own admin status");
        }
        let user = await updateUser(id, updatedUser);
        if (!user) {
            return handleError(res, 404, "User not found");
        }
        res.send(user);
    }
    catch (err) {
        const status = err.status || (err.message && err.message.startsWith('Validation') ? 400 : 500);
        return handleError(res, status, err.message);
    }
})

// change password
router.put("/:id/change-password", auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;
        const userInfo = req.user;

        if (id !== userInfo._id) {
            return handleError(res, 403, "Authorization Error: Only the verified user can change their password");
        }

        if (!currentPassword || !newPassword) {
            return handleError(res, 400, "Current password and new password are required");
        }

        // Password validation (same as registration validation)
        const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*-]).{8,20}$/;
        if (!passwordRegex.test(newPassword)) {
            return handleError(res, 400, "Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number, and one special character (!@#$%^&*-)");
        }

        const result = await changePassword(id, currentPassword, newPassword);
        res.send(result);
    } catch (error) {
        handleError(res, error.status || 400, error.message);
    }
});

// delete user with password confirmation
router.delete("/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        const userInfo = req.user;

        if (id !== userInfo._id && !userInfo.isAdmin) {
            return handleError(res, 403, "Authorization Error: Only an admin or the verified user can delete their profile");
        }

        // If it's the user's own profile, require password confirmation
        if (id === userInfo._id && !userInfo.isAdmin) {
            if (!password) {
                return handleError(res, 400, "Password confirmation is required to delete your account");
            }

            const user = await User.findById(id);
            if (!user) {
                return handleError(res, 404, "User not found");
            }

            const isPasswordCorrect = await comparePasswords(password, user.password);
            if (!isPasswordCorrect) {
                return handleError(res, 401, "Incorrect password");
            }
        }

        const user = await deleteUser(id);
        res.send(user);
    } catch (error) {
        return handleError(res, error.status || 400, error.message);
    }
});

module.exports = router;