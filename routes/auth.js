const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
var authMiddleware = require("../middleware/authMiddleware"); // Create a middleware for authentication
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const JWT_SECRET = "mysimplesecret"

// Route 1: create a user with POST request : https://front-back-both-client.vercel.app/api/auth/createuser
router.post(
  "/createuser",
  [
    body("name").isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").isLength({ min: 3 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    let success = false;

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // checks whether the user with this email already exists

    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res
        .status(400)
        .json({ error: "Sorry, a user with this email already exists" });
    }

    try {
      
      // Hash and salt the user's password
      const salt = await bcrypt.genSalt(10); // You can configure the number of salt rounds as needed
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      // Create a new user object with the hashed password
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      });
      

      

      // Save the user to the database
      await newUser.save();

      // Generate a JWT token for the user  
      const data = {
        user: {
          id: newUser._id
        }
      }

      var token = jwt.sign(data, JWT_SECRET);
      console.log(token)

      

      // Send a success response with the token
      success= true;
      res.status(201).json({ success, message: "User created successfully", token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  }
);


// Route 2: Authenticate an existing user to login: https://front-back-both-client.vercel.app/api/auth/userlogin
router.post(
  "/userlogin",
  [
    body("email", 'Enter a valid email').isEmail(),
    body("password", 'Password can not be blank').exists(),
  ], 
  async (req, res) => {
    const errors = validationResult(req);
    let success = false;

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if the user with the provided email exists
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }

      // Compare the provided password with the stored hashed password
      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        success = false;
        return res.status(400).json({success, error: "Invalid password" });
      }

      // If the email and password match, create and send a JWT token
      const data = {
        user: {
          id: user._id
        }
      }
      const token = jwt.sign(data, JWT_SECRET);
      success = true;

      res.json({ success, token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  }
);



// Route 3: Get details of logged-in user using POST: https://front-back-both-client.vercel.app/api/auth/logindetails
router.post("/logindetails", authMiddleware, async (req, res) => {
  try {
    // The user ID is available in req.user.id due to the authMiddleware
    const user = await User.findById(req.user.id).select("-password"); // Exclude the password field from the response
  

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});




module.exports = router;








