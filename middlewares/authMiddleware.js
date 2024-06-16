const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');

const requireAuth = (req, res, next) => {
  const token = req.cookies.token;
  
  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, (err, payload) => {
      if (err) {
        console.log(err);
        res.redirect('/login');
      } else {
        console.log(payload);
        next();
      }
    })
  } else {
    res.redirect('/login');
  }

  next();
};

const getUser = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, async (err, payload) => {
      if (payload) {
        console.log('payload: ', payload);
        let user = await UserModel.findById(payload.id);
        console.log('user: ', user);
        res.locals.user = user;
        next();
      } else {
        console.log(err.message);
      }
    })
  }
  res.locals.user = null;
  next();
};

module.exports = { requireAuth, getUser };