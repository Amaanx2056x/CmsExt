const express = require('express')
const {
  deleteMail
} = require("../../helpers/mail")
const bcrypt = require('bcryptjs')
const {
  isEmpty,
  uploadsDir
} = require('../../helpers/upload')
const fs = require('fs')
const Post = require('../../models/Post')
const Category = require('../../models/Category')
const Comment = require('../../models/Comment')
const User = require('../../models/User')
const {
  userAuth,
  adminAuth
} = require('../../helpers/auth')
const router = express.Router()


router.all('/*', userAuth, (req, res, next)=> {
  next()
})
router.get('/', adminAuth, (req, res, next)=> {
  const counts = [
    Post.countDocuments({}).exec(),
    Post.countDocuments({
      user: req.user.id
    }).exec(),
    Comment.countDocuments({
      user: req.user.id
    }).exec(),
    Comment.countDocuments({}).exec(),
    Category.countDocuments({}).exec(),
  ];
  Promise.all(counts).then(([postCount, mypost, mycomment, commentCount, categoryCount])=> {
    res.render('layouts/admin/dashboard', {
      postCount, mypost, mycomment, commentCount, categoryCount
    })
  })
})

router.get('/profile', (req, res)=> {
  User.findOne({
    _id: req.user.id
  }).then((user)=> {
    res.render('layouts/admin/profile', {
      user
    })
  })
})

router.delete('/profile/:id', (req, res)=> {
  const toRemove = [
    User.findOne({
      _id: req.params.id
    }).exec(),
    Post.find({
      user: req.user
    }).exec(),
    Comment.deleteMany({
      user: req.user
    }).exec()
  ]
  Promise.all(toRemove).then(([user, posts])=> {

    user.deleteOne()
    posts.forEach((post)=> {
      if (post.file) {
        fs.unlink(uploadsDir + post.file, (err)=> {})
      }
      post.deleteOne()
    })
    deleteMail(
      user.username,
      user.email)
    req.flash('success_msg',
      `Account was deleted successfully!`)
    res.redirect('/login')

  })
})

router.put('/profile/editProfile/:id', (req, res)=> {
  User.findOne({
    _id: req.user.id
  }).then((user)=> {
    var passRegEx = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})")
    let errors = []
    bcrypt.compare(req.body.oldpassword,
      user.password,
      (err, match)=> {
        if (err) {
          errors.push({
            message: 'Old password is incorrect!'
          })
        }
        if (req.body.username.trim().length > 20 || req.body.username.trim().length < 4) {
          errors.push({
            message: 'Name needs to be 4-20 characters!'
          })
        }
        if (!(req.body.newpassword.toString().match(passRegEx))) {
          errors.push({
            message: 'Password must contain atleast 8 letters : 1 lowercase, 1 uppercase and 1 Numeric'
          })
        }
        if (req.body.newpassword != req.body.cnewpassword) {
          errors.push({
            message: 'Password does not match!'
          })
        }
        if (errors.length > 0) {
          res.render('layouts/admin/profile/', {
            errors
          })
        } else {
          user.username = req.body.username,
          user.password = req.body.newpassword
          bcrypt.genSalt(10, (err, salt)=> {
            bcrypt.hash(user.password, salt, (err, hash)=> {
              user.password = hash
              user.save().then((saved)=> {
                req.flash('success_msg', 'Profile is modified, Please log in to continue')
                res.redirect('/login')
              }).catch((error)=> {
                req.flash('error_msg', 'User with that name already exists.')
                res.redirect('/admin/profile')
              })
            })
          })
        }
      })
  })
})


module.exports = router