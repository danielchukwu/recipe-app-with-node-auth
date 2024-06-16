const UserModel = require("../models/User");
const jwt = require("jsonwebtoken");

const maxAge = 3 * 24 * 60 * 60;  // 3days * 24hrs * 60mins * 60seconds
const createToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_KEY, { expiresIn: maxAge}) // 3days * 24hrs * 60mins * 60seconds
}
const setToken = (res, token) => {
  res.cookie('token', token, { httpOnly: true, secure: true, maxAge: maxAge * 1000})
}

module.exports.signup_get = (req, res) => {
  res.render('signup', {user: res.locals.user});
}

module.exports.login_get = (req, res) => {
  res.render('login', {user: res.locals.user});
}

module.exports.signup_post = async (req, res) => {
  const {email, password} = req.body;
  try {
    const newUser = await UserModel.create({email, password});
    const token = createToken(newUser._id);
    setToken(res, token);
    res.status(200).json(newUser);
  } catch (err) {
    const errors = handleError(err);
    console.log(errors);
    res.status(400).json({'errors': errors});
  }
}

module.exports.login_post = async (req, res) => {
  const {email, password} = req.body;
  try {
    const user = await UserModel.login(email, password);
    const token = await createToken(user._id);
    setToken(res, token);
    res.json({user: user.id});
  } catch (err) {
    const errors = handleError(err);
    res.status(404).json({ errors });
  }
}

module.exports.logout_get = (req, res) => {
  res.cookie('token', '', { maxAge: 1});
  res.redirect('/login');
};

// ----------------------------------------------------------------

// only handles errors thrown by the mongoose schema - 
// which are mostly create and updating errors
function handleError(err) {
  const errors = {}

  if (err.message.includes('email')) {
    errors.email = err.message;
    return errors;
  }
  if (err.message.includes('password')) {
    errors.password = err.message;
    return errors;
  }
  

  if (err.code === 11000){
    errors.email = 'Email already exists'
    return errors;
  }

  if (err.message.includes('User validation failed')){
    Object.values(err.errors).forEach(({ properties }, i) => {
      errors[properties.path] = err.message;
    })
  }
  
  return errors
}