// yar ya file hm ya bna rha kAH JB user logges in ho gya ha ya check krraha ha kah user real ma logges in ho gya ha ya testing hoti ha token ko check krka 
// agr to kisi na user ka payload ma change krna ki harkat ki to signature change ho ja eg aaoe login nhi ho ga 

const jwt= require('jsonwebtoken'); 
const usermodel = require('../models/usermodel');
const { model } = require('mongoose');

module.exports = async (req, res, next) => {
    try {
        const token = req.cookies.token; // Assuming the token is stored in cookies
        if (!token) {
            req.flash("error", "You need to login first");
            return res.redirect('/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await usermodel.findById(decoded.userId); // Fixed: userId instead of id

        if (!user) {
            req.flash("error", "User not found");
            return res.redirect('/login');
        }

        req.user = user; // Attach user to request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error("Authentication error:", error);
        req.flash("error", "Invalid token");
        return res.redirect('/login');
    }
}