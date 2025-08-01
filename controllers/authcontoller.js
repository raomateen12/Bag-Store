// acha is file ma ya scn horaha ha kah ma register aur login ka code likh raha hoon jo ki user ko register aur login karne ki suvidha dega. Isme hm bcrypt ka use kar rahe hain password ko hash karne ke liye aur jwt ka use kar rahe hain token generate karne ke liye.or in future kisi file ma use hona howa to hma direct inhi module ka name bs waha likh dien ga


const userModel = require("../models/usermodel");
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken");
const {generateToken} = require("../utils/generateToken");
module.exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = await userModel.create({
            username,
            email,
            password: hashedPassword
        });

        // Generate JWT token
        const token = generateToken(user);

        // Set token in cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // Set to true in production
            maxAge: 3600000 // 1 hour
        });

        // Remove password from response for security
        const userResponse = {
            _id: user._id,
            username: user.username,
            email: user.email,
            cart: user.cart
        };

        res.status(201).json({ message: "User registered successfully", user: userResponse });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}


module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Find user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Compare passwords yaha pr user ka pswword match horaha ha like jb usna sign up kiya to password hash ho kr store howa or jb login howa to mn na bcrypt ka compare function use kiya hai jo ki password ko hash krke check karta hai ki user ka password sahi hai ya nahi
        // Compare provided password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Generate JWT token
        const token = generateToken(user);

        // Set token in cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // Set to true in production
            maxAge: 3600000 // 1 hour
        });

        // Remove password from response for security
        const userResponse = {
            _id: user._id,
            username: user.username,
            email: user.email,
            cart: user.cart
        };

        res.status(200).json({ message: "Login successful", user: userResponse });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}