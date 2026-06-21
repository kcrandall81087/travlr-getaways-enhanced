const mongoose = require('mongoose');
const User = require('../models/user');
const passport = require('passport');

const register = async (req, res) => {
    // Validate that name, email, and password are present.
        if (!req.body.name || !req.body.email || !req.body.password) {
            return res
            .status(400)
            .json({ "message": "All fields required" });
        }

    // Create a new user instance
    const user = new User(
        {
            name: req.body.name,            // set username
            email: req.body.email,          // set email
            password: ''                    // start with empty password
        });

    user.setPassword(req.body.password);  // set user password
    const q = await user.save();

    if (!q) 
    {
        // database returned no data
        return res
            .status(400)
            .json({ "message": "Registration failed" });
    } else {
        // return user token
        const token = user.generateJWT();
        return res
            .status(200)
            .json(token);
    }
};

const login = async (req, res) => {
    // Validate message to ensure that email and password are present
    if (!req.body.email || !req.body.password) {
        return res
            .status(400)
            .json({ "message": "All fields required" });
    }

    // Delegate authentication to passport module
    passport.authenticate('local', (err, user, info) => {
        let token;

        if (err) {
            return res
                .status(404)
                .json(err);
        }

        if (user) { // Auth succeeded - generate JWT and return to caller
            token = user.generateJWT();
            return res
                .status(200)
                .json(token);
        } else {
            return res
                .status(401)
                .json(info);
        }
    })(req, res);
};

// Export methods that drive endpoints
module.exports = {
    register,
    login
};