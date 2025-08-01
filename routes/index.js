const express = require('express');
const router = express.Router();
const isloggedIn = require('../middlewares/isLoggesIn'); // Fixed path

const usermodel = require('../models/usermodel'); // Importing the user model
const productmodel = require('../models/productmodel'); // Importing the product model

router.get('/', async function(req, res) {
    try {
        let error = req.flash("error");
        let success = req.flash("success");
        
        // Get all products for homepage display
        let products = await productmodel.find();
        
        // Check if user is logged in
        let isLoggedIn = false;
        let user = null;
        
        if (req.cookies.token) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
                user = await usermodel.findById(decoded.userId);
                if (user) isLoggedIn = true;
            } catch (err) {
                // Token invalid, user not logged in
            }
        }
        
        res.render('index', { 
            error, 
            success, 
            products, 
            isLoggedIn, 
            user 
        });
    } catch (error) {
        console.error("Homepage error:", error);
        res.render('index', { 
            error: ["Something went wrong"], 
            success: [],
            products: [], 
            isLoggedIn: false, 
            user: null 
        });
    }
});

// Login page route (public access)
router.get('/login', function(req, res) {
    let error = req.flash("error");
    res.render('login', { error });
});

// Register page route (public access)
router.get('/register', function(req, res) {
    let error = req.flash("error");
    res.render('register', { error });
});

// Route to render the shop page with products
// This route checks if the user is logged in before allowing access to the shop page
router.get('/shop', isloggedIn, async function(req, res) {
    try {
        let product = await productmodel.find();
        let success = req.flash("success");
        let error = req.flash("error");
        
        // Get current user with populated cart for cart count
        let user = await usermodel.findOne({ email: req.user.email }).populate('cart');
        
        res.render("partials/shop", { 
            product, 
            success, 
            error,
            user,
            isLoggedIn: true
        });
    } catch (error) {
        console.error("Shop page error:", error);
        req.flash("error", "Error loading shop page");
        res.redirect('/');
    }
});


// Route to render the shop page with products
// This route checks if the user is logged in before allowing access to the shop page

router.get('/cart', isloggedIn, async function(req, res) {
    try {
        let user = await usermodel.findOne({ email: req.user.email }).populate('cart');
        if (!user) {
            req.flash("error", "User not found");
            return res.redirect('/login');
        }
        
        let error = req.flash("error");
        let success = req.flash("success");
        
        // Calculate total bill
        const bill = user.cart.reduce((total, product) => total + product.Price, 0);
        
        res.render('partials/cart', { user, error, success, bill });
    } catch (error) {
        console.error("Error fetching user cart:", error);
        req.flash("error", "Error loading cart");
        res.redirect('/shop');
    }
});


// Route to add a product to the user's cart
// This route checks if the user is logged in before allowing them to add a product to their cart

router.get('/addtocart/:id', isloggedIn, async function(req, res) {
    let user = await usermodel.findOne({ email: req.user.email }); // Fetching the user from the database
    user.cart.push(req.params.id); // Adding the product ID to the user's cart
    await user.save(); // Saving the updated user document
    req.flash("success", "Product added to cart successfully");
    res.redirect('/shop'); // Redirecting to the shop page after adding to cart
});



// Route to remove a product from the user's cart   
router.get('/removefromcart/:id', isloggedIn, async function(req, res) {
    let user = await usermodel.findOne({ email: req.user.email }); // Fetching the user from the database
    user.cart.pull(req.params.id); // Removing the product ID from the user's cart
    await user.save(); // Saving the updated user document
    req.flash("success", "Product removed from cart successfully");
    res.redirect('/cart'); // Redirecting to the cart page after removing from cart
});

// Route to render the orders page
// This route checks if the user is logged in before allowing access to the orders page
router.get('/orders', isloggedIn, function(req, res) {
    res.send("orders");
});

// Logout route for users
router.get('/logout', function(req, res) {
    res.clearCookie('token');
    req.flash("success", "You have been logged out successfully");
    res.redirect('/');
});

// Clear cart route
router.get('/clear-cart', isloggedIn, async function(req, res) {
    try {
        let user = await usermodel.findOne({ email: req.user.email });
        user.cart = [];
        await user.save();
        req.flash("success", "Cart cleared successfully");
        res.redirect('/cart');
    } catch (error) {
        console.error("Error clearing cart:", error);
        req.flash("error", "Error clearing cart");
        res.redirect('/cart');
    }
});

module.exports = router;
// Exporting the router to be used in the main app file