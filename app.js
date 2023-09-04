require('dotenv').config();

const express = require('express');

const app = express();

const expressLayout = require('express-ejs-layouts');

const cookieParser = require('cookie-parser');

const session = require('express-session');

const MongoStore = require('connect-mongo');

const connectDB = require('./server/config/db');

const methodOverride = require('method-override');

const PORT = process.env.PORT || 3000;

// connect db 
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL
    }),

}))

app.use(express.static('public'));

// template engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

app.listen(PORT, () => {
    console.log("Listening on port " + PORT);
});

