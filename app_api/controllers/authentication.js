const User = require('../models/user');
const passport = require('passport');

const register = async (req, res, next) => {
  try {
    if (!req.body.name || !req.body.email || !req.body.password) {
      return res
        .status(400)
        .json({ message: 'Name, email, and password are required.' });
    }

    const email = req.body.email.toLowerCase().trim();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: 'An account with this email already exists.' });
    }

    const user = new User({
      name: req.body.name.trim(),
      email,
      password: ''
    });

    user.setPassword(req.body.password);
    await user.save();

    const token = user.generateJWT();

    return res.status(201).json(token);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res
      .status(400)
      .json({ message: 'Email and password are required.' });
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'Authentication failed.' });
    }

    if (user) {
      const token = user.generateJWT();

      return res
        .status(200)
        .json(token);
    }

    return res
      .status(401)
      .json(info);
  })(req, res);
};

module.exports = {
  register,
  login
};