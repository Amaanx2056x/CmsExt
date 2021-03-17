const express = require('express')
const Post = require('../../models/Post')
const Category = require('../../models/Category')
const User = require('../../models/User')
const {
  welcomeMail,
  forgetMail
} = require('../../helpers/mail')
const validator = require ('validator')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const router = express.Router()

router.get('/', (req, res)=> {
  const perPage = 4;
  const page = req.query.page || 1;
  Post.find({
    status: 'public'
  })
  .skip((perPage * page)-perPage)
  .limit(perPage)
  .populate('user').then((post)=> {
    console.log(post)
    if (post.length == 0) {
      res.render('layouts/home', {
        message: "No Post have been made yet.", pageTitle: "HOME"
      })
    } else {
      Post.countDocuments().then((count)=> {
        Category.find({
          approved: true
        }).then((category)=> {

          res.render('layouts/home', {
            post,
            category,
            current: parseInt(page),
            pages: Math.ceil(count/perPage),
            pageTitle: "HOME"
          })
        })
      })
    }
  })
})


router.get('/login', (req, res)=> {
  res.render('layouts/login')
})

passport.use(new LocalStrategy({
  usernameField: 'username'
}, (username, password, done)=> {
  User.findOne({
    username
  }).then((user)=> {

    if (!user) return done(null, false, {
      message: 'No user found!'
    })
    bcrypt.compare(password, user.password, (err, matched)=> {
      if (err) return err
      if (matched) {
        if (! user.isVerified) {
          return done(null, false, {
            message: 'Account is not verified, Please check your email for OTP and verify your Account to sign in'
          })
        } else {
          return done(null, user)
        }
      } else {
        return done(null, false, {
          message: 'Incorrect Password!'
        })
      }
    })
  })
}))

passport.serializeUser((user, done)=> {
  done(null, user.id)
})
passport.deserializeUser((id, done)=> {
  User.findById(id, (err, user)=> {
    done(err, user)
  })
})
router.post('/login', (req, res, next)=> {
  passport.authenticate('local', {
    successRedirect: '/admin/posts/myposts',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
})

router.get('/logout', (req, res)=> {
  req.logOut()
  res.redirect('/login')
})

router.get('/register', (req, res)=> {
  res.render('layouts/register')
})

router.post('/register', (req, res)=> {
  var passRegEx = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})")
  let errors = []

  if (req.body.username.trim().length > 20 || req.body.username.trim().length < 4) {
    errors.push({
      message: 'Name needs to be 4-20 characters!'
    })
  }
  if (!validator.isEmail(req.body.email)) {
    errors.push({
      message: 'Please enter a valid e-mail!'
    })
  }
  if (!(req.body.password.toString().match(passRegEx))) {
    errors.push({
      message: 'Password must contain atleast 8 letters : 1 lowercase, 1 uppercase and 1 Numeric'
    })
  }
  if (req.body.password != req.body.cpassword) {
    errors.push({
      message: 'Passwords does not match!'
    })
  }
  if (errors.length > 0) {
    res.render('layouts/register', {
      errors,
      username: req.body.username,
      email: req.body.email
    })
  } else {
    User.findOne({
      email: req.body.email
    }).then((user)=> {
      if (!user) {
        var otp = Math.floor((Math.random()*100000)+1)
        const newUser = new User({
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          token: otp
        })
        bcrypt.genSalt(10, (err, salt)=> {
          bcrypt.hash(newUser.password, salt, (err, hash)=> {
            newUser.password = hash
            newUser.save().then((saved)=> {

              welcomeMail(saved.username, saved.email, otp)
              req.flash('success_msg', `An e-mail with otp has been sent to ${saved.email}`)
              res.redirect('/verify')
            }).catch((error)=> {
              req.flash('error_msg', `A user with that name already exists`)
            })
          })
        })
      } else {
        req.flash('error_msg', 'User with that email already exists!')
        res.redirect('/login')
      }
    })
  }
})
router.get('/post/:id', (req, res)=> {
  Post.findOne({
    _id: req.params.id
  })
  .populate({
    path: 'comments',
    populate: {
      path: 'user',
      models: 'users'
    }})
  .populate('user')
  .populate('lastEdited')
  .then((post)=> {
    Category.find({
      approved: true
    }).then((categories)=> {
      res.render('layouts/post', {
        post, categories, first: (post.comments.length > 0) ? true: false
      })
    })
  })
})

router.get('/forgot', (req, res)=> {
  res.render('layouts/control/forgot')
})
router.post('/forgot', (req, res)=> {
  User.findOne({
    email: req.body.email
  }).then((user)=> {
    if (!user) {
      req.flash('error_msg', 'No user with that e-mail found!')
      res.redirect('/forgot')
    } else {
      var token = Math.floor((Math.random()*100000)+1)
      user.token = token
      user.save()

      forgetMail(user.username, user.email, token)
      req.flash('success_msg', `An e-mail with Password Reset instructions had been sent to ${user.email}`)
      res.redirect('/reset')
    }
  })
})

router.get('/reset', (req, res)=> {
  res.render('layouts/control/reset')
})


router.post('/reset', (req, res)=> {
  var passRegEx = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})")
  User.findOne({
    token: req.body.token
  }).then((user)=> {
    if (!user) {
      req.flash('error_msg', 'Invalid token!')
      res.redirect('/reset')
    } else {
      if (!(req.body.password.toString().match(passRegEx))) {
        req.flash('error_msg', 'Password must contain atleast 8 letters : 1 lowercase, 1 uppercase and 1 Numeric')
        res.redirect('/reset')
      } else if (req.body.password != req.body.cpassword) {
        req.flash('error_msg', 'Passwords not matched!')
        res.redirect('/reset')
      } else {
        user.password = req.body.password
        bcrypt.genSalt(10, (err, salt)=> {
          bcrypt.hash(user.password, salt, (err, hash)=> {
            user.password = hash,
            user.token = 0
            user.save().then((saved)=> {
              req.flash('success_msg', 'Password changed Successfully!')
              res.redirect('/login')

            })
          })
        })
      }
    }
  })
})


router.get('/verify', (req, res)=> {
  res.render('layouts/control/verify')
})

router.post('/verify', (req, res)=> {
  User.findOne({
    token: req.body.otp
  }).then((user)=> {
    if (!user) {
      req.flash('error_msg', 'Invalid OTP!')
      res.redirect('/verify')
    } else {
      user.token = 0,
      user.isVerified = true
      user.save()
      req.flash('success_msg', 'Account verified sucessfully!')
      res.redirect('/login')
    }
  })
})

router.post('/search', (req, res)=> {
  const perPage = 4;
  const page = req.query.page || 1;
  Post.find({
    "title": {
      $regex: req.body.searchText,
      $options: 'i'
    }})
  .skip((perPage * page)-perPage)
  .limit(perPage)
  .populate ('user')
  .then((post)=> {
    var count = (post.length)+1
    if (post.length == 0) {
      res.render('layouts/home', {
        message: "No Posts found.",
        pageTitle: "SEARCH RESULTS:",
        current: parseInt(page),
        pages: Math.ceil(count/perPage)
      })
    } else {
      Category.find({
        approved: true
      }).then((category)=> {
        res.render('layouts/home', {
          post,
          category,
          current: parseInt(page),
          pages: Math.ceil(count/perPage),
          pageTitle: "SEARCH RESULTS:"
        })
      })
    }
  })
})

router.get('/categories/:id', (req, res)=> {
  const perPage = 4;
  const page = req.query.page || 1;
  Post.find({
    category: req.params.id
  })
  .populate('category')
  .skip((perPage * page)-perPage)
  .limit(perPage)
  .populate('user')
  .then((post)=> {
    var count = (post.length)+1
    if (post.length == 0) {
      res.render('layouts/home', {
        message: "No posts in this category found.",
        current: parseInt(page),
        pages: Math.ceil(count/perPage)

      })
    } else {
      Category.find({
        approved: true
      }).then((category)=> {
        res.render('layouts/home', {
          post,
          category,
          pageTitle: `Posts from Category: ${post[0].category.name}`,
          current: parseInt(page),
          pages: Math.ceil(count/perPage)
        })
      })
    }
  })
})
module.exports = router