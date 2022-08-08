const express = require('express')
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/user');
const mongoose = require('mongoose');
const db = "mongodb://127.0.0.1:27017/superadmin";
const bcrypt = require('bcrypt');
const checkAuth = require('../middleware/check-auth')
const nodemailer = require("nodemailer");
require('dotenv').config();

// const Crud = require('../models/crud')
mongoose.connect(db, err => { 
  if(err) {
    console.error('Error!' +err)
  }else {
    console.log('Connected to mongodb')
  }
})

router.get('/', function(req, res){
  console.log(req.body.name)
  res.send('from API route')
})

router.post('/register', (req, res) => {
  bcrypt.hash(req.body.password, 10 ,(err, hash) => {
    if (err) {
      return res.json({success: false, message:'hasing issue'})
    }else {
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hash,
      });
       user.save()
      .then((_) =>{
        res.json({success: true, message: 'Registration successful'})
      })
      .catch((err) => {
        if (err.code === 11000){
          return res.json({success: false, message:"email already exists!"})
        }else {
        res.json({success: false, message:err})
        }
      })

      console.log(req.body.name)
    }
  })
  


})

router.post('/login', (req, res) =>{
  User.find({email: req.body.email}).exec()
  .then((result) =>{
if (result.length < 1){
  return res.json({success: false, message: 'User not found'})

}
const user = result[0];
bcrypt.compare(req.body.password, user.password, (err, result) =>{
  if(result) {
    const payload = {
      userId : user._id,
      auth: user.auth, 
      verify: user.isverify
    }
    const token = jwt.sign(payload, process.env.TOKEN_KEY)
    return res.json({success: true, token : token, message:'Login Successfull'})
  }else {
    return res.json({success: false, message:'Password do not match'})
  }
})
  }).catch(err => {
    res.json({success: false, message: 'authentication failed'})
  })
  
})


router.get('/profile/:id', checkAuth.auth,checkAuth.isverified, checkAuth.admin, async (req, res) => {
  const userId = req.userData.userId;
  const authCheck = req.userData.auth;
  
  console.log(userId, authCheck)

  if (authCheck === "admin"){
   await User.findById(userId)
    .exec()
    .then((result) => {
      return res.json({success: true, data: result})
    }).catch (err => {
      return res.json ({success: false, message: 'server error'})
    })
  }else {
    return res.json({success: false, message: 'you are not admin'})

  }
  
})




router.get('/allDetails',checkAuth.auth,checkAuth.isverified,  (req, res) => {
  User.find((err, employees) => {
    if(err){
      console.log(err)
    }else {
      res.json(employees)
    }
  })
})


router.get('/delete/:id',checkAuth.auth,checkAuth.isverified, checkAuth.admin, (req, res) => {
  User.findByIdAndRemove({ _id: req.params.id }, function (err, employee) {
    if (err) res.json(err);
    else res.json('user Deleted Successfully');
    });
})

router.get('/view/:id', checkAuth.auth,checkAuth.isverified, (req, res) => {
  // let id = req.params.id;
  const userId = req.userData.userId;

  User.findById(userId, function (err, employee) {
  res.json(employee);
  });
})

router.post('/update/:id',checkAuth.auth,checkAuth.isverified, checkAuth.admin, (req, res) => {
  User.findById(req.params.id,  (err, employee) => {
    if (!employee)
    return next(new Error('Unable To Find Employee With This Id'));
    else {
    employee.name = req.body.name;
    employee.email = req.body.email;
    employee.auth = req.body.auth;
    employee.isverify = req.body.isverify;
      
    employee.save().then(emp => {
    return res.json(employee);
    })
    .catch(err => {
    return res.status(400).send("Unable To Update Employee");
    });
    }

    });

})

router.post('/verify/:id',checkAuth.auth, (req, res, next) => {

  const authCheck = req.userData.auth;

if (authCheck === "superadmin"){
  User.findById(req.params.id,  (err, employee) => {
    if (!employee)
    return next(new Error('Unable To Find user With This Id'));
    else {
    employee.isverify = req.body.isverify;
      
    employee.save().then(emp => {
    return res.json(employee);
    })
    .catch(err => {
    return res.status(400).send("Unable To Update user verify");
    });
    }

    });
}
else {
  return res.json({success: false, message:"you are not superadmin"})
}



})



let transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'kiera.homenick91@ethereal.email',
    pass: 'h29EAZ5vmeDP2j5z1X'
}
});

router.post('/add',checkAuth.auth,checkAuth.isverified, checkAuth.admin, (req, res) => {
 
   
   


  bcrypt.hash(req.body.password, 10 ,(err, hash) => {
    if (err) {
      return res.json({success: false, message:'hasing issue'})
    }else {
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hash,
        auth: req.body.auth, 
        isverify: req.body.isverify,
      });
       user.save()
      .then((_) =>{
        res.json({success: true, message: 'create New User successful'})
      })
      .catch((err) => {
        if (err.code === 11000){
          return res.json({success: false, message:"email already exists!"})
        }else {
        res.json({success: false, message:err})
        }
      })

      const payload = {
        userId : user._id,
      }
      const token = jwt.sign(payload, process.env.TOKEN_KEY, {expiresIn: '300s'})
    const resetPasswordUrl = `http://localhost:3000/resetPassword?token=`+token;
      let info = transporter.sendMail({
        from: '"Fred Foo 👻" kiera.homenick91@ethereal.email', // sender address
        to: "kiera.homenick91@ethereal.email", // list of receivers
        subject: "Reset Password ✔", // Subject line
        text : `Dear user,
      To reset your password, click on this link: ${resetPasswordUrl}
      If you did not request any password resets, then ignore this email.`
      }).then((data)=>{console.log('Mail sent', data)})
      .catch(err => {console.error('Failure',err)})
    }
  })
  
})

router.post('/resetPassword' , (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];
console.log(token)
  if (!token) {
    return res.status(403).send("A token is to reset");
  }
  try {
    const decoded = jwt.verify(token, 'herohamada');
    console.log(decoded.userId)
    bcrypt.hash(req.body.password, 10 ,(err, hash) => {
      if (err) {
        return res.json({success: false, message:'hasing issue'})
      }else {
            User.findById(decoded.userId,  (err, employee) => {
          if (!employee)
          return next(new Error('Unable To Find Employee With This Id'));
          else {
          employee.password = hash;
      
            
          employee.save().then(emp => {
          return res.json(employee);
          })
          .catch(err => {
            // return res.json({success: false, message:'update issue'})
            console.log('unable to update')
          });
          }
          });
      }})
  
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
})



module.exports = router;