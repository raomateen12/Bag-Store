const express = require('express');
const router = express.Router();
const ownerModel = require('../models/owners-models'); // Corrected file name
const ownersModels = require('../models/owners-models');

router.get('/adminpanel', function(req, res) {
   let success= req.flash("success", "Welcome to the Admin Panel");
    res.render("createproducts",{success});
});

if(process.env.Node_ENV==="development");
router.post("/create",  async function(req, res) {
   let owners = await owners-models.find();
   if(owners.length>0){
       res.status(400).send("Owner already exists");
   } else {
       let owner = new ownerModel({
           username: req.body.username,
           email: req.body.email,
           password: req.body.password
       });
       await owner.save();
       res.status(201).send(owner);
   }
});
module.exports = router;