const jwt = require('jsonwebtoken')
const User = require('../models/user')
const httpStatus = require('http-status');

require('dotenv').config();
const config = process.env;

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

const auth  = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decode = jwt.verify(token, process.env.TOKEN_KEY)
  req.userData = decode 
  next();
  }catch(err){
    res.json({success: false, message: 'Auth Failed'})
  }
  }

const admin =  (req, res, next) => {
  const authCheck = req.userData.auth;
  console.log()
if (authCheck === "admin") {
  return next();
}
else {
  return res.status(403).send("you are not admin");
}
}


const isverified =  (req, res, next) => {
  const verifyCheck = req.userData.verify;
  console.log(verifyCheck)
if (verifyCheck === true) {
  return next();
}
else {
  return res.status(403).send("you are not verified");
}
}





module.exports = {
  verifyToken: verifyToken,
  auth: auth,
  admin: admin,
  isverified: isverified
};

