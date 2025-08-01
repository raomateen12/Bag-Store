module.exports = function generateToken(user){
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: user._id, isadmin: user.isadmin }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
    return token;
}