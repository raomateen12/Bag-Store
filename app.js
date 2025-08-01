const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const path = require('path');
const expressSession = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');

const ownersRouter = require('./routes/ownersRouter');
const usersRouter = require('./routes/usersRouter');
const productsRouter = require('./routes/productsRouter');
const indexRouter = require('./routes/index');

require('dotenv').config();  //.env ma jitni bhi cheezien likhi hoi ha to hm us file ki cheezien us ekrksta ha 
// Importing mongoose connection
const db= require('./config/mongoose-connection');   

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session middleware setup
app.use(expressSession({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000  // 24 hours
    }
}));

// Flash middleware setup (session ke baad hona chahiye)
app.use(flash());

// Set up view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Method override for PUT/DELETE requests
app.use(methodOverride('_method'));

app.use("/", indexRouter);
app.use("/owners",ownersRouter);  // hm kahien ga slash owenrs wali sari request bhaj dien owner wali router pr
app.use("/users",usersRouter);
app.use("/products",productsRouter);

// Test route
app.get('/test', (req, res) => {
    console.log('Test route hit');
    res.render('test', { message: 'EJS is working!' });
});

app.listen(3000, function() {
    console.log(" Server is running on http://localhost:3000");
});