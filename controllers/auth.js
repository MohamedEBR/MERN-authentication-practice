const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { createJWT } = require("../utils/auth");
const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

exports.signup = async (req, res, next) => { // Use async/await for cleaner syntax
  let { name, email, password, password_confirmation } = req.body;
  let errors = [];

  if (!name) {
    errors.push({ name: "required" });
  }
  if (!email) {
    errors.push({ email: "required" });
  }
  if (!emailRegexp.test(email)) {
    errors.push({ email: "invalid" });
  }
  if (!password) {
    errors.push({ password: "required" });
  }
  if (!password_confirmation) {
    errors.push({ password_confirmation: "required" });
  }
  if (password !== password_confirmation) { // Use strict comparison
    errors.push({ password: "mismatch" });
  }

  if (errors.length > 0) {
    return res.status(422).json({ errors });
  }

  try {
    const existingUser = await User.findOne({ email }); // Use findOne for brevity

    if (existingUser) {
      return res.status(422).json({ errors: [{ user: "email already exists" }] });
    }

    const salt = await bcrypt.genSalt(12); // Consider using a higher cost for better security
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword });
    const savedUser = await user.save();

    res.status(200).json({ success: true, result: savedUser });
  } catch (err) {
    console.error(err); // Log the error for better debugging
    res.status(500).json({ errors: [{ error: "Something went wrong" + err }] });
  }
};

exports.signin = async (req, res) => {
  let { email, password } = req.body;
  let errors = [];

  if (!email) {
    errors.push({ email: "required" });
  }
  if (!emailRegexp.test(email)) {
    errors.push({ email: "invalid email" });
  }
  if (!password) {
    errors.push({ password: "required" });
  }

  if (errors.length > 0) {
    return res.status(422).json({ errors });
  }

  try {
    const user = await User.findOne({ email }, { collation: { locale: 'en' } }); // Use collation

    if (!user) {
      return res.status(404).json({ errors: [{ user: "not found" }] });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ errors: [{ password: "incorrect" }] });
    }

    const access_token = createJWT(user.email, user._id, 3600);

    res.status(200).json({ success: true, token: access_token, message: user });
  } catch (err) {
    console.error(err); // Log the error for better debugging
    res.status(500).json({ errors: [{ error: "Something went wrong" }] });
  }
};