const express = require('express');
const router = express.Router();
const ownerModel = require('../models/owners-models');
const productModel = require('../models/productmodel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Owner login page
router.get('/login', function(req, res) {
    let error = req.flash("error");
    res.render('partials/owner-login', { error });
});

// Admin dashboard
router.get('/admin', async function(req, res) {
    try {
        // Check if owner is logged in (implement middleware later)
        let products = await productModel.find();
        let success = req.flash("success");
        let error = req.flash("error");
        
        // Dummy owner data for now
        let owner = { username: "Admin" };
        
        res.render('partials/admin', { owner, products, success, error });
    } catch (error) {
        console.error("Error loading admin dashboard:", error);
        req.flash("error", "Error loading dashboard");
        res.redirect('/owners/login');
    }
});

// Create product page
router.get('/create-product', function(req, res) {
    let error = req.flash("error");
    res.render('partials/createproducts', { error });
});

// Handle product creation
router.post('/create', upload.single('image'), async function(req, res) {
    try {
        let { name, price, discount, bgcolor, panecolor, textcolor } = req.body;
        
        // Validate required fields
        if (!name || !price) {
            req.flash("error", "Product name and price are required");
            return res.redirect('/owners/create-product');
        }
        
        // Create product object
        let productData = {
            name,
            Price: parseFloat(price),
            discount: parseInt(discount) || 0,
            bgcolor: bgcolor || 'gray-200',
            panecolor: panecolor || 'white',
            textcolor: textcolor || 'black'
        };
        
        // Add image if uploaded
        if (req.file) {
            productData.image = req.file.buffer;
        }
        
        // Create product
        let product = await productModel.create(productData);
        
        req.flash("success", `Product "${name}" created successfully!`);
        res.redirect('/owners/admin');
        
    } catch (error) {
        console.error("Error creating product:", error);
        req.flash("error", "Failed to create product");
        res.redirect('/owners/create-product');
    }
});

// Owner logout
router.post('/logout', function(req, res) {
    res.clearCookie('owner-token');
    req.flash("success", "Logged out successfully");
    res.redirect('/owners/login');
});

module.exports = router;
