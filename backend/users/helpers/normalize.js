
const normalizeUser = async (user) => {
    return {
        ...user,
        isAdmin: user.isAdmin ?? false,
        createdAt: user.createdAt || new Date()
    };
}

module.exports = { normalizeUser };