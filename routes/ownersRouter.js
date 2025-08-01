const express = require('express');
const router = express.Router();
const ownerModel = require('../models/owners-models');
const productModel = require('../models/productmodel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const isOwnerLoggedIn = require('../middlewares/isOwnerLoggedIn');

// Multer configuration for file uploads - File system storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/uploads');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Create unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Check if file is image
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Owner registration page (only in development)
router.get('/register', function(req, res) {
    if (process.env.NODE_ENV !== 'development') {
        req.flash("error", "Owner registration is not available in production");
        return res.redirect('/owners/login');
    }
    let error = req.flash("error");
    res.render('partials/owner-register', { error });
});

// Handle owner registration (only in development)
router.post('/register', async function(req, res) {
    try {
        if (process.env.NODE_ENV !== 'development') {
            req.flash("error", "Owner registration is not available in production");
            return res.redirect('/owners/login');
        }

        let { username, email, password, gstin } = req.body;

        // Check if owner already exists
        const existingOwner = await ownerModel.findOne({ 
            $or: [{ email }, { gstin }] 
        });
        if (existingOwner) {
            req.flash("error", "Owner with this email or GSTIN already exists");
            return res.redirect('/owners/register');
        }

        // Validate required fields
        if (!username || !email || !password || !gstin) {
            req.flash("error", "All fields are required");
            return res.redirect('/owners/register');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create owner
        let owner = await ownerModel.create({
            username,
            email,
            password: hashedPassword,
            gstin
        });

        req.flash("success", "Owner account created successfully! Please login.");
        res.redirect('/owners/login');

    } catch (error) {
        console.error("Error creating owner:", error);
        req.flash("error", "Registration failed. Please try again.");
        res.redirect('/owners/register');
    }
});

// Owner login page
router.get('/login', function(req, res) {
    let error = req.flash("error");
    res.render('partials/owner-login', { error });
});

// Handle owner login
router.post('/login', async function(req, res) {
    try {
        let { email, password, gstin } = req.body;

        // Find owner by email and GSTIN
        const owner = await ownerModel.findOne({ email, gstin });
        if (!owner) {
            req.flash("error", "Invalid credentials or GSTIN");
            return res.redirect('/owners/login');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, owner.password);
        if (!isPasswordValid) {
            req.flash("error", "Invalid credentials");
            return res.redirect('/owners/login');
        }

        // Generate JWT token
        jwt.sign({ ownerId: owner._id }, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) {
                console.error("Error signing JWT:", err);
                req.flash("error", "Login failed. Please try again.");
                return res.redirect('/owners/login');
            }

            // Set token in cookie
            res.cookie('owner-token', token, {
                httpOnly: true,
                secure: false,
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            req.flash("success", "Welcome to Admin Panel!");
            res.redirect('/owners/admin');
        });

    } catch (error) {
        console.error("Owner login error:", error);
        req.flash("error", "Login failed. Please try again.");
        res.redirect('/owners/login');
    }
});

// Admin dashboard (Protected Route)
router.get('/admin', isOwnerLoggedIn, async function(req, res) {
    try {
        let products = await productModel.find();
        let success = req.flash("success");
        let error = req.flash("error");
        
        res.render('partials/admin', { 
            owner: req.owner, // From middleware
            products, 
            success, 
            error 
        });
    } catch (error) {
        console.error("Error loading admin dashboard:", error);
        req.flash("error", "Error loading dashboard");
        res.redirect('/owners/login');
    }
});

// Create product page (Protected Route)
router.get('/create-product', isOwnerLoggedIn, function(req, res) {
    let error = req.flash("error");
    res.render('partials/createproducts', { error });
});

// Handle product creation (Protected Route)
router.post('/create', isOwnerLoggedIn, upload.single('image'), async function(req, res) {
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
            productData.image = `/uploads/${req.file.filename}`; // Store full path
        } else {
            // Handle case where no image is uploaded, if you have a default
            // Or throw an error if image is required
            req.flash("error", "Product image is required.");
            return res.redirect('/owners/create-product');
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

// Owner logout GET route
router.get('/logout', function(req, res) {
    res.clearCookie('owner-token');
    req.flash("success", "You have been logged out successfully");
    res.redirect('/owners/login');
});

// Delete single product
router.delete('/delete-product/:id', isOwnerLoggedIn, async function(req, res) {
    try {
        const productId = req.params.id;
        await productModel.findByIdAndDelete(productId);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Clear all products
router.delete('/clear-all-products', isOwnerLoggedIn, async function(req, res) {
    try {
        await productModel.deleteMany({});
        res.status(200).json({ message: 'All products cleared successfully' });
    } catch (error) {
        console.error("Error clearing products:", error);
        res.status(500).json({ error: 'Failed to clear products' });
    }
});

// Serve product images
router.get('/product-image/:id', async function(req, res) {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product || !product.image) {
            return res.status(404).send('Image not found');
        }
        
        // Check if image is stored as Buffer (old format)
        if (Buffer.isBuffer(product.image)) {
            // Set appropriate content type for images
            res.set('Content-Type', 'image/jpeg'); // Default to jpeg
            return res.send(product.image);
        }
        
        // Handle string filenames (new format)
        if (typeof product.image === 'string') {
            // Convert Buffer to string if it's encoded as Buffer
            let imagePath = product.image;
            if (product.image.type === 'Buffer' && product.image.data) {
                imagePath = Buffer.from(product.image.data).toString();
            }
            
            // Handle both old format (just filename) and new format (full path)
            if (imagePath.startsWith('/uploads/')) {
                imagePath = imagePath.replace('/uploads/', '');
            }
            
            const fullImagePath = path.join(__dirname, '../public/uploads', imagePath);
            
            // Check if file exists
            const fs = require('fs');
            if (!fs.existsSync(fullImagePath)) {
                return res.status(404).send('Image file not found');
            }
            
            return res.sendFile(fullImagePath);
        }
        
        // If neither Buffer nor string, return 404
        return res.status(404).send('Image format not supported');
        
    } catch (error) {
        console.error("Error serving image:", error);
        res.status(500).send('Error loading image');
    }
});

// Edit product page
router.get('/edit-product/:id', isOwnerLoggedIn, async function(req, res) {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) {
            req.flash("error", "Product not found");
            return res.redirect('/owners/admin');
        }
        let error = req.flash("error");
        let success = req.flash("success");
        res.render('partials/edit-product', { product, error, success, owner: req.owner });
    } catch (error) {
        console.error("Error fetching product:", error);
        req.flash("error", "Error loading product");
        res.redirect('/owners/admin');
    }
});

// Update product
router.post('/edit-product/:id', isOwnerLoggedIn, upload.single('image'), async function(req, res) {
    try {
        const { name, Price, discount, bgcolor, panecolor, textcolor } = req.body;
        const productId = req.params.id;

        const updateData = {
            name,
            Price: parseInt(Price),
            discount: parseInt(discount),
            bgcolor,
            panecolor,
            textcolor
        };

        // If new image is uploaded, add it to update data
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`; // Store full path
        }

        const updatedProduct = await productModel.findByIdAndUpdate(productId, updateData, { new: true });
        
        if (!updatedProduct) {
            req.flash("error", "Product not found");
            return res.redirect('/owners/admin');
        }

        req.flash("success", "Product updated successfully");
        res.redirect('/owners/admin');
    } catch (error) {
        console.error("Error updating product:", error);
        req.flash("error", "Failed to update product");
        res.redirect('/owners/admin');
    }
});

module.exports = router;
