const express = require('express')
const Category = require('../../models/Category')
const Post = require('../../models/Post')
const {
  isEmpty,
  uploadsDir
} = require('../../helpers/upload')
const fs = require('fs')
const {
  userAuth,
  adminAuth
} = require('../../helpers/auth')
const router = express.Router()


router.all('/*', userAuth, (req, res, next)=> {
  next()
})
router.get('/', adminAuth, (req, res, next)=> {
  Category.find({
    approved: true
  }).then((categories)=> {
    if (categories.length == 0) {
      res.render('layouts/admin/categories/allcategories', {
        message: "No categories available, Please create one."
      })
    } else {
      res.render('layouts/admin/categories/allcategories', {
        categories
      })
    }
  })
})

router.post('/create', adminAuth, (req, res, next)=> {
  if (req.body.name.trim().length() <= 0 || req.body.name.trim.length() > 15) {
    req.flash('error_msg', 'Category name can be 3-15 characters!')
    res.redirect('/admin/categories/')
  } else {
    const newCategory = new Category({
      name: req.body.name,
      approved: (req.body.isAdmin ? true: false)
    })
    newCategory.save().then((saved)=> {
      req.flash('success_msg', `Category ${saved.name} was created successfully!`)
      res.redirect('/admin/categories/')
    }).catch((e)=> {
      req.flash('error_msg', `Unknown error while creating category!`)
      res.redirect('/admin/categories/')
    })
  }
})

router.get('/update/:id', adminAuth, (req, res, next)=> {
  Category.findOne({
    _id: req.params.id
  }).then((category)=> {
    res.render('layouts/admin/categories/update', {
      category
    })
  })
})

router.put('/update/:id', adminAuth, (req, res, next)=> {
  Category.findOne({
    _id: req.params.id
  }).then((category)=> {
    if (req.body.name.trim().length <= 0 || req.body.name.trim().length > 15) {
      req.flash('error_msg', 'Category name can be 3-15 characters!')
      res.redirect('/admin/categories/')
    } else {
      category.name = req.body.name
      category.save().then((saved)=> {
        req.flash('success_msg', `Category ${category.name} was updated successfully!`)
        res.redirect('/admin/categories/')
      }).catch((e)=> {
        req.flash('error_msg', `Unknown error while creating category!`)
        res.redirect('/admin/categories/')
      })
    }
  })
})

router.delete('/:id', adminAuth, (req, res, next)=> {
  Category.findOne({
    _id: req.params.id
  }).then((category)=> {
    Post.find({
      category: req.params.id
    })
    .populate({
      path: 'comments', populate: {
        path: 'user', models: 'users'
      }})
    .populate('user')
    .then((posts)=> {
      posts.forEach((post)=> {
        fs.unlink(uploadsDir + post.file, (err)=> {
          if (post.comments.length > 0) {
            post.comments.forEach((comment)=> {
              comment.deleteOne()
            })
          }
          post.deleteOne()
        })
      })
    })
    category.deleteOne()
    req.flash('success_msg', `Category ${category.name} was deleted successfully!`)
    res.redirect('/admin/categories/')
  })
})

router.get('/reqCategory', (req, res)=> {
  res.render('layouts/admin/categories/reqCategory');
})

router.post('/reqCategory', (req, res)=> {
  Category.find({
    name: req.body.name
  }).then(category=> {
    if (category.length > 0) {
      req.flash('error_msg', 'Category with that name Already exists!')
      res.redirect('/admin/categories/reqCategory')
    } else if (req.body.name.trim().length <= 2 || req.body.name.trim().length > 15) {
      req.flash('error_msg', 'Category name can be 3-15 characters!')
      res.redirect('/admin/categories/reqCategory')
    } else {
      const newCategory = new Category({
        name: req.body.name
      })
      newCategory.save().then((saved)=> {
        req.flash('success_msg', `Category ${saved.name} is requested, Please wait for the Admin approval.`)
        res.redirect('/admin/categories/reqCategory')
      }).catch((e)=> {
        req.flash('error_msg', `Unknown error while requesting category!`)
        res.redirect('/admin/categories/reqCategory')
      })
    }
  })
})

router.put('/accept/:id', adminAuth, (req, res, next)=> {
  Category.findOne({
    _id: req.params.id
  }).then(category=> {
    category.approved = true;
    category.save().then(saved=> {
      req.flash('success_msg', `Category ${category.name} was Approved!`)
      res.redirect('/admin/categories/pending')
    }).catch((e)=> {
      req.flash('error_msg', `Unknown error while approving category!`)
      res.redirect('/admin/categories/pending')
    })
  })
})

router.get('/pending', adminAuth, (req, res, next)=> {
  Category.find({
    approved: false
  }).then((categories)=> {
    if (categories.length == 0) {
      res.render('layouts/admin/categories/PendingCat', {
        message: "No pending category requests."
      })
    } else {
      res.render('layouts/admin/categories/PendingCat', {
        categories
      })
    }
  })
})

module.exports = router