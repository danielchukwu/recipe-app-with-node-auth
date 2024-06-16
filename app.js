const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, getUser } = require('./middlewares/authMiddleware');
require('dotenv').config();

const app = express();

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = process.env.DBURI;
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => {
    console.log('App started at http://localhost:3000/');
    app.listen(3000);
  })
  .catch((err) => console.log(err));

// routes
app.get('*', getUser)
app.get('/', (req, res) => res.render('home', {user: res.locals.user}));
app.get('/smoothies', requireAuth, (req, res) => res.render('smoothies', {user: res.locals.user}));
app.use(authRoutes);