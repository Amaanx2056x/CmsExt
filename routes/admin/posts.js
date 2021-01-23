const express = require('express')
const Post = require('../../models/Post')
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
      let filename = ""
      if (!isEmpty(req.files)) {
        let file = req.files.file
        filename = Date.now()+"-"+file.name
        let dirUploads = './public/uploads/'

        file.mv(dirUploads+filename, (err)=> {
          if (err) throw err;
        })
      }


      let allowComments = true
      if (!req.body.allowComments) {
        allowComments = false
      }
      const newPost = new Post({
        user: req.user.id,
        title: req.body.title,
        status: req.body.status,
        category: req.body.category,
        allowComments: allowComments,
        body: req.body.body,
        file: filename
      })
      newPost.save().then((saved)=> {
        req.flash('success_msg', `Post ${saved.title} was created successfully!`)
        res.redirect('/admin/posts/')
      }).catch((err)=> {
        console.log('error', err)
      })
    }
  })
})

router.put('/update/:id', (req, res)=> {
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
      post.user = req.user.id,
      post.title = req.body.title,
      post.status = req.body.status,
      post.category = req.body.category,
      post.allowComments = allowComments,
      post.body = req.body.body

      if (!isEmpty(req.files)) {
        let file = req.files.file
        filename = Date.now()+"-"+file.name
        let dirUploads = './public/uploads/'
        post.file = filename

        file.mv(dirUploads+filename, (err)=> {
          if (err) throw err;
        })
      }

      post.save().then((saved)=> {
        req.flash('success_msg', `Post ${saved.title} was updated successfully!`)
        res.redirect('/admin/posts/myposts')
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
        if (post.comments.length > 0) {
          post.comments.forEach((comment)=> {
            comment.deleteOne()
          })
        }
        post.deleteOne()
        req.flash('success_msg', `Post ${post.title} was deleted successfully!`)
        res.redirect('/admin/posts/myposts')
      })
  })
})

module.exports = router