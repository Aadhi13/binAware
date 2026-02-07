const register = async (req, res) => {
    res.send("Register Endpoint");
};

const login = async (req, res) => {
    res.send("Login Endpoint");
};

module.exports = {
    register,
    login
};
