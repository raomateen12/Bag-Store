const express = require('express');
const router = express.Router();
const userModel = require('../models/usermodel'); // Corrected file name
const bcrypt = require('bcryptjs');
const jwt= require('jsonwebtoken');
router.get('/', function(req, res) {
    res.send('User Home Page');
});

router.post("/register", async function(req, res) {
    try{
        let{ username, email, password } = req.body;
        
        // Validate required fields
        if (!username || !email || !password) {
            req.flash("error", "All fields are required");
            return res.redirect('/register');
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ email: email });
        if (existingUser) {
            req.flash("error", "User with this email already exists");
            return res.redirect('/register');
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        let user = await userModel.create({
            username,
            email,
            password: hashedPassword
        });

        // Generate JWT token for the new user
        jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) {
                console.error("Error signing JWT:", err);
                req.flash("error", "Registration failed. Please try again.");
                return res.redirect('/register');
            }

            // Set token in cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
                maxAge: 3600000
            });

            // Success message and redirect to shop page
            req.flash("success", `Welcome to Scatch, ${user.username}! You have been registered and logged in successfully.`);
            res.redirect('/shop');
        });
    } catch (error) {
        console.error("Error creating user:", error);
        req.flash("error", "Registration failed. Please try again.");
        res.redirect('/register');
   }
});

// Login route for web forms
router.post("/login", async function(req, res) {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await userModel.findOne({ email: email });
        if (!user) {
            req.flash("error", "Invalid email or password");
            return res.redirect('/login');
        }
        
        // Compare password with hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        console.log("Login attempt:");
        console.log("Email:", email);
        console.log("Password Match:", isPasswordValid);
        
        if (isPasswordValid) {
            // Generate JWT token for successful login
            jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
                if (err) {
                    console.error("Error signing JWT:", err);
                    req.flash("error", "Login failed. Please try again.");
                    return res.redirect('/login');
                }

                // Set token in cookie
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: false,
                    maxAge: 3600000
                });

                req.flash("success", `Welcome back, ${user.username}!`);
                res.redirect('/shop');
            });
        } else {
            req.flash("error", "Invalid email or password");
            res.redirect('/login');
        }
        
    } catch (error) {
        console.error("Login error:", error);
        req.flash("error", "Something went wrong. Please try again.");
        res.redirect('/login');
    }
});

// Logout route - cookie clear karne ke liye
router.post("/logout", function(req, res) {
    res.clearCookie('token');
    req.flash("success", "Logged out successfully!");
    res.redirect('/');
});

module.exports = router;