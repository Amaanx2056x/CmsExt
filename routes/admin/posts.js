const express = require('express')
const Post = require('../../models/Post')
const cloudinary = require("cloudinary").v2;
require('../../helpers/cloudConf')
const {
  userAuth,
  adminAuth
} = require('../../helpers/auth')
const Category = require('../../models/Category')
const {
  isEmpty,
  uploadsDir
} = require('../../helpers/upload')
const fs = require('fs')
const router = express.Router()

router.all('/*', userAuth, (req, res, next)=> {
  next()
})
router.get('/', adminAuth, (req, res, next)=> {

  Post.find({})
  .populate('category')
  .populate('user')
  .then((posts)=> {
    if (posts.length == 0) {
      res.render('layouts/admin/posts/allposts', {
        message: "No posts available"
      })
    } else {
      res.render('layouts/admin/posts/allposts', {
        posts
      })
    }
  })
})


router.get('/myposts', (req, res)=> {
  Post.find({
    user: req.user.id
  })
  .populate('category')
  .then((posts)=> {
    if (posts.length == 0) {
      res.render('layouts/admin/posts/myposts', {
        message: "You have not created any posts yet"
      })
    } else {
      res.render('layouts/admin/posts/myposts', {
        posts
      })
    }
  })
})

router.get('/create', (req, res)=> {
  Category.find({
    approved: true
  }).then((categories)=> {
    if (categories.length == 0) {
      req.flash("error_msg", 'No categories available right now, Please request Admin to create one.')
      res.redirect('/admin/categories/reqCategory')
    } else {
      res.render('layouts/admin/posts/create', {
        categories
      })
    }
  })
})

router.get('/update/:id', (req, res)=> {
  Post.findOne({
    _id: req.params.id
  }).then((post)=> {
    Category.find({
      approved: true
    }).then((categories)=> {
      if (categories.length == 0) {
        req.flash("error_msg", 'you need to create a category first.')
        res.redirect('/admin/categories/')
      } else {
        res.render('layouts/admin/posts/update', {
          post, categories
        })
      }
    })
  })
})

router.post('/create', (req, res)=> {

  Category.find({
    approved: true
  }).then(categories=> {
    let errors = []
    if (req.body.title.trim().length > 20 || req.body.title.trim().length < 4) {
      errors.push({
        message: 'Title needs to be 4-20 characters!'
      })
    }
    if (req.body.body.trim().length < 10) {
      errors.push({
        message: 'Please enter a description (ATLEAST 10 CHARACTERS)'
      })
    }
    if (errors.length > 0) {
      res.render('layouts/admin/posts/create', {
        errors,
        categories,
        title: req.body.title,
        body: req.body.body
      })
    } else {
      const newPost = new Post()
      let filename = ""


      if (!isEmpty(req.files)) {
        let file = req.files.file
        filename = Date.now()+"-"+file.name
        let dirUploads = './public/uploads/'


        file.mv(dirUploads+filename, (err)=> {
          if (err) throw err;
          cloudinary.uploader.upload('./public/uploads/'+filename).then(result=> {
            newPost.file = result.url,
            newPost.publicid = result.public_id
            newPost.save()
          })
        })
      }


      let allowComments = true
      if (!req.body.allowComments) {
        allowComments = false
      }

      newPost.user = req.user.id,
      newPost.title = req.body.title,
      newPost.status = req.body.status,
      newPost.category = req.body.category,
      newPost.allowComments = allowComments,
      newPost.body = req.body.body

      newPost.save().then((saved)=> {
        req.flash('success_msg', `Post ${saved.title} was created successfully!`)
        res.redirect('/admin/posts/myposts')
      }).catch((err)=> {
        console.log('error', err)
      })
    }
  })
})

router.put('/update/:id', (req,
  res)=> {
  Post.findOne({
    _id: req.params.id
  }).then(post=> {
    let errors = []
    if (req.body.title.trim().length > 20 || req.body.title.trim().length < 4) {
      errors.push({
        message: 'Title needs to be 4-20 characters!'
      })
    }
    if (req.body.body.trim().length < 10) {
      errors.push({
        message: 'Please enter a description (ATLEAST 10 CHARACTERS)'
      })
    }
    if (errors.length > 0) {
      Category.find({
        approved: true
      }).then(categories=> {
        res.render('layouts/admin/posts/update', {
          errors,
          post,
          categories

        })
      })
    } else {
      let allowComments = true
      if (!req.body.allowComments) {
        allowComments = false
      }
      post.lastEdited = req.user.id,
      post.title = req.body.title,
      post.status = req.body.status,
      post.category = req.body.category,
      post.allowComments = allowComments,
      post.body = req.body.body
      if (post.file) {
        cloudinary.uploader.destroy(post.publicid.toString()).then(result=> {
          post.file = ""
          post.publicid = ""
          post.save()
        })
      }

      if (!isEmpty(req.files)) {
        let file = req.files.file
        filename = Date.now()+"-"+file.name
        let dirUploads = './public/uploads/'


        file.mv(dirUploads+filename, (err)=> {
          if (err) throw err;
          cloudinary.uploader.upload('./public/uploads/'+filename).then(result=> {
            post.file = result.url,
            post.publicid = result.public_id
            post.save()


          })

        })
      }

      post.save().then((saved)=> {
        req.flash('success_msg', `Post ${saved.title} was updated successfully!`)
        var landing = (req.user.isAdmin ? '/admin/posts/': '/admin/posts/myposts/')
        res.redirect(landing)
      })
    }
  })
})

router.delete('/:id', (req, res)=> {
  Post.findOne({
    _id: req.params.id
  })
  .populate('comments')
  .then((post)=> {
    fs.unlink(uploadsDir + post.file,
      (err)=> {
        if (post.file) {
          cloudinary.uploader.destroy(post.publicid.toString())
        }
        if (post.comments.length > 0) {
          post.comments.forEach((comment)=> {
            comment.deleteOne()
          })
        }
        post.deleteOne()
        req.flash('success_msg', `Post ${post.title} was deleted successfully!`)
        var landing = (req.user.isAdmin ? '/admin/posts/': '/admin/posts/myposts/')
        res.redirect(landing)
      })
  })
})





router.get('/postComment/:id', (req, res)=> {
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
  .then((post)=> {
    if (post.comments.length == 0) {
      res.render('layouts/admin/comments/allcomments', {
        post,

        pageTitle: `Comments on : ${post.title}`,
        message: 'No comments made yet.'
      })
    } else {
      res.render('layouts/admin/comments/allcomments', {
        post,

        pageTitle: `Comments on : ${post.title}`
      })
    }
  })
})
module.exports = router