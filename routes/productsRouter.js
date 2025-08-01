const express = require('express');
const upload = require('../config/multer-config');
const router = express.Router();

const productModel = require('../models/productmodel'); // Corrected file name

router.post('/create',upload.single("image") , async function(req, res) {
    try{
   let product= await  productModel.create({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        image: req.file.buffer, // Store the image buffer directly
        category: req.body.category
    });

    req.flash("success", "Product created successfully");
    res.redirect("/owners/adminpanel");
} catch (error) {
    res.send("Error creating product: " + error.message);
}
});
module.exports = router;