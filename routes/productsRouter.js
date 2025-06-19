const express = require('express');
const router = express.Router();


router.get('/', function(req, res) {
    res.send('products Home Page');
});
module.exports = router;