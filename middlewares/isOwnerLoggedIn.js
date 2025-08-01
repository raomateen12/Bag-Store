// Owner authentication middleware
// Ye check karta hai ke owner logged in hai ya nahi

const jwt = require('jsonwebtoken');
const ownerModel = require('../models/owners-models');

module.exports = async (req, res, next) => {
    try {
        const token = req.cookies['owner-token']; // Owner ka token cookies mein
        if (!token) {
            req.flash("error", "Access denied. Please login as owner.");
            return res.redirect('/owners/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const owner = await ownerModel.findById(decoded.ownerId);

        if (!owner) {
            req.flash("error", "Owner not found. Please login again.");
            return res.redirect('/owners/login');
        }

        req.owner = owner; // Attach owner to request object
        next(); // Proceed to next middleware
    } catch (error) {
        console.error("Owner authentication error:", error);
        req.flash("error", "Invalid owner token. Please login again.");
        return res.redirect('/owners/login');
    }
}
