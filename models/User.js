const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require('bcrypt');

// (){}:""
const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: [true, "please enter an email"],
    unique: [true, "email already exists"],
    lowercase: true,
    validate: [isEmail, "Please enter a valid email"]
  },
  password: { type: String, required: [true, 'Please enter a password'], minlength: [6, 'Password should be atleast 6 characters'] },
});

// mongoose hooks
userSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  console.log(this, 'PASSWORD HASHED - ***');
  next();
});

// static methods on mongoose schema
userSchema.statics.login = async function (email, password) {
  // get user by their email
  const user = await this.findOne({ email });
  // if user exists proceed else throw email doesn't exist exception
  if (user){
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (passwordMatches) return user;
    else throw new Error('incorrect password');
  }
  throw new Error('email does not exist');
};

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;