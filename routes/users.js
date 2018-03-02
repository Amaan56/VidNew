const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//Load Idea model
require('../models/User');
const User = mongoose.model('users');

//Login Route GET
router.get('/login', (req, res) => {
  res.render('users/login');
});

//Login Route POST
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/ideas',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

//Register Route GET
router.get('/register', (req, res) => {
  res.render('users/register');
});

//Register Route POST
router.post('/register', (req, res) => {
  let errors = [];
  if (req.body.password != req.body.password2) {
    errors.push({ text: 'Password Do not Match' });
  }
  if (req.body.password.length < 4) {
    errors.push({ text: 'Password shoould be atleast 4 characters' });
  }
  if (errors.length > 0) {
    res.render('users/register', {
      errors: errors,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2
    });
  } else {
    User.findOne({
      email: req.body.email
    }).then(user => {
      if (user) {
        req.flash('error_msg', 'Email Already Registered');
        res.redirect('/users/register');
      } else {
        newUser = {
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
        };
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            new User(newUser)
              .save()
              .then(user => {
                req.flash('success_msg', 'You are now regsitered');
                res.redirect('/users/login');
              })
              .catch(err => {
                console.log(err);
                return;
              });
          });
        });
      }
    });
  }
});
//Logout Router
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});
module.exports = router;
