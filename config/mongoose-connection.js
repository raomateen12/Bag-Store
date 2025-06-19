const mongoose= require('mongoose');        
mongoose.connect("mongodb://localhost:27017/scatch") // ya url tb tk ha jb tk ma develpmen tkrraha jb mn na isa host krka priudction reDY KIYA TO YA URL NHI CHLA GA BCZ IS CONNECTION KA MTLB HA KAH MERI MACHINE PR JO MNGON DB HA US SERVER SA CONNECT HO JAO LAKIN JB  MA HOST KRON GA TO YA MERI MACHIEN TO NIKLA GAE TB THEN MUJHE DIRECT MONGO DB SERVER SA CONNECTION CHHIYA HO GA  ISLIYA HM DYNAMICALLY CONNECT KRIEN GA ISA 
.then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
});

modeule.exports = mongoose.connection; // Export the mongoose connection for use in other files