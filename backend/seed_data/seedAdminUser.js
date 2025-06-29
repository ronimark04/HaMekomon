const User = require("../users/models/mongodb/User");
const { generatePassword } = require("../users/helpers/bcrypt");

const ADMIN_CONFIG = {
    username: "admin",
    email: "admin@hamekomon.com",
    password: "Admin@123!",
    isAdmin: true
};

async function seedAdminUser() {
    try {
        // Check if admin user already exists
        const existingAdmin = await User.findOne({
            $or: [
                { username: ADMIN_CONFIG.username },
                { email: ADMIN_CONFIG.email }
            ]
        });

        if (existingAdmin) {
            console.log("Admin user seeding failed: Admin user already exists.");
            return;
        }

        // Hash the password
        const hashedPassword = await generatePassword(ADMIN_CONFIG.password);

        // Create admin user
        const adminUser = new User({
            username: ADMIN_CONFIG.username,
            email: ADMIN_CONFIG.email,
            password: hashedPassword,
            isAdmin: ADMIN_CONFIG.isAdmin
        });

        await adminUser.save();

        console.log("Admin user seeding succeeded!");

    } catch (error) {
        console.error("Admin user seeding failed:", error.message);
        throw error;
    }
}

module.exports = { seedAdminUser }; 