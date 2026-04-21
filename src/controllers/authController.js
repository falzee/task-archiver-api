const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { regisUser,findUserByUsername } = require("../models/authModel");

const register = async  (req, res) => {
    const { username,email, password, name } = req.body;

    if (!name || !username || !email || !password) {
        return res.status(400).json({ success: false, message: "User informations are required!" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await regisUser({
            username,
            password: hashedPassword,
            name,
            email,
        });

        res.status(201).json({
            success: true,
            message: "Register success",
            data: user,
        });
    } catch (error) {
        // console.error('Error registering user: ' + error.message);
        res.status(500).json({ error: 'Error registering user!' });
    } 
}

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password required" });
    }

    try {
        // find user
        const user = await findUserByUsername(username);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        // compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Incorrect Password",
            });
        }

        // create JWT
        const token = jwt.sign(
            {
                user_id: user.user_id,
                username: user.username,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // remove password before sending response
        delete user.password;

        res.cookie("token", token, {
            httpOnly: true,        // cannot be accessed via JS (prevents XSS)
            secure: false,         // true in production (HTTPS)
            sameSite: "none",       // or "strict"
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        // res.json({ message: "Login success" });

        res.json({
            success: true,
            message: "Login success",
        });

    } catch (error) {
        // console.error(error);
        res.status(500).json({ success: false, message: "Login error", });
    }
};


module.exports = { 
    register,
    login,
};